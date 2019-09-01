using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Watching;
using Xunit;

namespace Pobs.Tests.Integration.Watching
{
    public class IndexWatchingQuestionsTests : IDisposable
    {
        private string _buildUrl(int? pageSize = null, long? beforeWatchId = null) =>
          "/api/questions/_/watching?" +
          (pageSize.HasValue ? $"pageSize={pageSize}&" : "") +
          (beforeWatchId.HasValue ? $"beforeWatchId={beforeWatchId}&" : "");

        private readonly int _userId;
        private readonly IEnumerable<Question> _watchingQuestions;
        private readonly Question _notWatchingQuestion;

        public IndexWatchingQuestionsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;

            // Create 3 Questions, watch only 2
            var questions = DataHelpers.CreateQuestions(user, 3).ToArray();
            _watchingQuestions = new[] { questions[0], questions[1] };
            foreach (var question in _watchingQuestions)
            {
                DataHelpers.CreateWatch(user.Id, question);
            }

            _notWatchingQuestion = questions[2];
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldGetWatchingQuestionsOnly()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingQuestionsListModel>(responseContent);

                Assert.Equal(2, responseModel.Questions.Count());
                foreach (var question in _watchingQuestions)
                {
                    var responseQuestion = responseModel.Questions.First(x => x.QuestionId == question.Id);
                    Assert.Equal(question.Slug, responseQuestion.QuestionSlug);
                    Assert.Equal(question.Text, responseQuestion.QuestionText);
                }
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsByPageSize()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl(pageSize: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingQuestionsListModel>(responseContent);

                Assert.Single(responseModel.Questions);
                var mostRecentWatchId = _watchingQuestions.SelectMany(x => x.Watches).Max(x => x.Id);
                Assert.Equal(mostRecentWatchId, responseModel.Questions[0].WatchId);
                Assert.Equal(mostRecentWatchId, responseModel.LastWatchId);
            }
        }

        [Fact]
        public async Task ShouldGetQuestionsBeforeWatchId()
        {
            var orderedWatchIds = _watchingQuestions.SelectMany(x => x.Watches).OrderByDescending(x => x.Id).ToArray();
            var mostRecentWatchId = orderedWatchIds[0].Id;
            var secondMostRecentWatchId = orderedWatchIds[1].Id;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl(beforeWatchId: mostRecentWatchId));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingQuestionsListModel>(responseContent);

                Assert.Single(responseModel.Questions);
                Assert.Equal(secondMostRecentWatchId, responseModel.Questions[0].WatchId);
                Assert.Equal(secondMostRecentWatchId, responseModel.LastWatchId);
            }
        }

        [Fact]
        public async Task ShouldHandleZeroItems()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                // Nothing should be before WatchId 1.
                var response = await client.GetAsync(_buildUrl(beforeWatchId: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingQuestionsListModel>(responseContent);
                Assert.Empty(responseModel.Questions);
                Assert.Equal(0, responseModel.LastWatchId);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
