using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class SearchQuestionsTests : IDisposable
    {
        private string _buildUrl(string q, long? pageNumber = null, long? pageSize = null) =>
            $"/api/questions/search?q={q}&" +
            (pageNumber.HasValue ? $"pageNumber={pageNumber}&" : "") +
            (pageSize.HasValue ? $"pageSize={pageSize}" : "");

        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly IEnumerable<Question> _questions;
        private readonly Question _unapprovedQuestion;

        public SearchQuestionsTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create multiple Questions and Answers
            _questions = DataHelpers.CreateQuestions(questionUser, 2, answerUser, 3);
            _unapprovedQuestion = DataHelpers.CreateQuestions(questionUser, 1, questionStatus: PostStatus.AwaitingApproval).Single();
        }

        [Fact]
        public async Task EmptyQuery_ShouldGetBadRequest()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(" "));
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Q is required.", responseContent);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsFilteredByQuery()
        {
            var questions = _questions.ToArray();
            var questionToQuery1 = questions[0];
            var questionToQuery1Words = questions[0].Text.Split(' ');
            var questionToQuery2 = questions[1];
            var questionToQuery2Words = questions[1].Text.Split(' ');
            var q = $"{questionToQuery1Words[1]} {questionToQuery2Words[0]} {questionToQuery2Words[1]}";

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(q));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionSearchResultsModel>(responseContent);

                Assert.Equal(2, responseModel.Questions.Length);
                // First result should match the Question with 2 matches
                Assert.Equal(questionToQuery2.Id, responseModel.Questions[0].Id);
                Assert.Equal(questionToQuery1.Id, responseModel.Questions[1].Id);

                // Check the defaults too
                Assert.Equal(20, responseModel.PageSize);
                Assert.Equal(1, responseModel.PageNumber);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsByPageNumber()
        {
            var questions = _questions.ToArray();
            var q = questions[0].Text + ' ' + questions[1].Text;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(q, pageNumber: 2, pageSize: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionSearchResultsModel>(responseContent);

                // Can't really assert anything else on this as we may have questions from other tests in the db.
                Assert.Single(responseModel.Questions);
                Assert.Equal(1, responseModel.PageSize);
                Assert.Equal(2, responseModel.PageNumber);
            }
        }

        [Fact]
        public async Task ShouldHandleZeroItems()
        {
            var questions = _questions.ToArray();
            var q = questions[0].Text + ' ' + questions[1].Text;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(q, pageNumber: 999));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionSearchResultsModel>(responseContent);
                Assert.Empty(responseModel.Questions);
                Assert.Equal(999, responseModel.PageNumber);
            }
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(int.MaxValue)]
        [InlineData(long.MaxValue)]
        public async Task InvalidPageNumber_ShouldGetBadRequest(long pageNumber)
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl("foo", pageNumber: pageNumber));
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("PageNumber must be between 1 and 9999.", responseContent);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsByPageSize()
        {
            var questions = _questions.ToArray();
            var q = questions[0].Text + ' ' + questions[1].Text;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(q, pageSize: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionSearchResultsModel>(responseContent);

                // Can't really assert anything else on this as we may have questions from other tests in the db.
                Assert.Single(responseModel.Questions);
                Assert.Equal(1, responseModel.PageSize);
                Assert.Equal(1, responseModel.PageNumber);
            }
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(201)]
        [InlineData(int.MaxValue)]
        [InlineData(long.MaxValue)]
        public async Task InvalidPageSize_ShouldGetBadRequest(long pageSize)
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl("foo", pageSize: pageSize));
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("PageSize must be between 1 and 200.", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
