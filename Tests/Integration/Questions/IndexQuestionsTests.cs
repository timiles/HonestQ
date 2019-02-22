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
    public class IndexQuestionsTests : IDisposable
    {
        private string _buildUrl(int? pageSize = null, long? beforeTimestamp = null, PostStatus? status = null) =>
            "/api/questions?" +
            (pageSize.HasValue ? $"pageSize={pageSize}&" : "") +
            (beforeTimestamp.HasValue ? $"beforeTimestamp={beforeTimestamp}&" : "") +
            (status.HasValue ? $"status={status}" : "");
        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly IEnumerable<Question> _questions;
        private readonly Question _unapprovedQuestion;
        private readonly Tag _approvedTag;
        private readonly Tag _unapprovedTag;

        public IndexQuestionsTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create multiple Questions and Answers
            _questions = DataHelpers.CreateQuestions(questionUser, 2, answerUser, 3);
            _unapprovedQuestion = DataHelpers.CreateQuestions(questionUser, 1, questionStatus: PostStatus.AwaitingApproval).Single();

            _approvedTag = DataHelpers.CreateTag(questionUser, isApproved: true, questions: _questions.ToArray());
            _unapprovedTag = DataHelpers.CreateTag(questionUser, isApproved: false, questions: _questions.ToArray());
        }

        [Fact]
        public async Task ShouldGetAllApprovedQuestions()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);

                foreach (var responseQuestion in responseModel.Questions)
                {
                    var question = _questions.FirstOrDefault(x => x.Id == responseQuestion.Id);
                    if (question != null)
                    {
                        Assert.Equal(question.Slug, responseQuestion.Slug);
                        Assert.Equal(question.Text, responseQuestion.Text);
                        Assert.Equal(3, responseQuestion.AnswersCount);

                        Assert.Contains(_approvedTag.Slug, responseQuestion.Tags.Select(x => x.Slug));
                        Assert.DoesNotContain(_unapprovedTag.Slug, responseQuestion.Tags.Select(x => x.Slug));
                    }
                }

                Assert.DoesNotContain(_unapprovedQuestion.Id, responseModel.Questions.Select(x => x.Id));

                // Not really sure how better to test the timestamp?
                Assert.True(responseModel.LastTimestamp > 0);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsByPageSize()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(pageSize: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);

                // Can't really assert anything else on this as we may have questions from other tests in the db.
                Assert.Single(responseModel.Questions);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsBeforeTimestamp()
        {
            var mostRecentQuestion = _questions.OrderByDescending(x => x.PostedAt).First();
            var beforeTimestamp = (mostRecentQuestion.PostedAt.ToUnixTimeMilliseconds() - 1);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(beforeTimestamp: beforeTimestamp));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);

                // Can't be sure what came back except must not include this Question at least.
                Assert.DoesNotContain(mostRecentQuestion.Id, responseModel.Questions.Select(x => x.Id));
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_StatusAwaitingApproval_ShouldGetQuestions()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_questionUserId, Role.Admin);

                var response = await client.GetAsync(_buildUrl(status: PostStatus.AwaitingApproval));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);

                Assert.Contains(_unapprovedQuestion.Id, responseModel.Questions.Select(x => x.Id));
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_StatusAwaitingApproval_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_questionUserId);

                var response = await client.GetAsync(_buildUrl(status: PostStatus.AwaitingApproval));
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldHandleZeroItems()
        {
            var beforeTimestamp = new DateTimeOffset(new DateTime(2000, 1, 1)).ToUnixTimeMilliseconds();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl(beforeTimestamp: beforeTimestamp));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);
                Assert.Empty(responseModel.Questions);
                Assert.Equal(0, responseModel.LastTimestamp);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
