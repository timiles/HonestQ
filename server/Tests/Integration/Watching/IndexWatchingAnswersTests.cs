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
    public class IndexWatchingAnswersTests : IDisposable
    {
        private string _buildUrl(int? pageSize = null, long? beforeWatchId = null) =>
          "/api/questions/_/answers/_/watching?" +
          (pageSize.HasValue ? $"pageSize={pageSize}&" : "") +
          (beforeWatchId.HasValue ? $"beforeWatchId={beforeWatchId}&" : "");

        private readonly int _userId;
        private readonly IEnumerable<Answer> _watchingAnswers;
        private readonly Answer _notWatchingAnswer;

        public IndexWatchingAnswersTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;

            // Create 3 Answers, watch only 2
            var answers = DataHelpers.CreateQuestions(user, 1, user, 3).Single().Answers.ToArray();
            _watchingAnswers = new[] { answers[0], answers[1] };
            foreach (var answer in _watchingAnswers)
            {
                DataHelpers.CreateWatch(user.Id, answer);
            }

            _notWatchingAnswer = answers[2];
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
        public async Task ShouldGetWatchingAnswersOnly()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingAnswersListModel>(responseContent);

                Assert.Equal(2, responseModel.Answers.Count());
                foreach (var answer in _watchingAnswers)
                {
                    var responseAnswer = responseModel.Answers.First(x => x.AnswerId == answer.Id);
                    Assert.Equal(answer.Slug, responseAnswer.AnswerSlug);
                    Assert.Equal(answer.Text, responseAnswer.AnswerText);
                    Assert.Equal(answer.Question.Id, responseAnswer.QuestionId);
                    Assert.Equal(answer.Question.Slug, responseAnswer.QuestionSlug);
                    Assert.Equal(answer.Question.Text, responseAnswer.QuestionText);
                }
            }
        }

        [Fact]
        public async Task ShouldGetAnswersByPageSize()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl(pageSize: 1));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingAnswersListModel>(responseContent);

                Assert.Single(responseModel.Answers);
                var mostRecentWatchId = _watchingAnswers.SelectMany(x => x.Watches).Max(x => x.Id);
                Assert.Equal(mostRecentWatchId, responseModel.Answers[0].WatchId);
                Assert.Equal(mostRecentWatchId, responseModel.LastWatchId);
            }
        }

        [Fact]
        public async Task ShouldGetAnswersBeforeWatchId()
        {
            var orderedWatchIds = _watchingAnswers.SelectMany(x => x.Watches).OrderByDescending(x => x.Id).ToArray();
            var mostRecentWatchId = orderedWatchIds[0].Id;
            var secondMostRecentWatchId = orderedWatchIds[1].Id;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_buildUrl(beforeWatchId: mostRecentWatchId));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<WatchingAnswersListModel>(responseContent);

                Assert.Single(responseModel.Answers);
                Assert.Equal(secondMostRecentWatchId, responseModel.Answers[0].WatchId);
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
                var responseModel = JsonConvert.DeserializeObject<WatchingAnswersListModel>(responseContent);
                Assert.Empty(responseModel.Answers);
                Assert.Equal(0, responseModel.LastWatchId);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
