using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Watching
{
    public class GetQuestionsTests : IDisposable
    {
        private readonly string _url = "/api/watching/questions";

        private readonly int _userId;
        private readonly Question _watchingQuestion;
        private readonly Question _notWatchingQuestion;

        public GetQuestionsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;

            var question = DataHelpers.CreateQuestions(user, 2).ToArray();
            _watchingQuestion = question[0];
            DataHelpers.CreateWatch(user.Id, _watchingQuestion);

            _notWatchingQuestion = question[1];
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_url);
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

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);

                Assert.Single(responseModel.Questions);
                Assert.Equal(this._watchingQuestion.Id, responseModel.Questions[0].Id);
                Assert.Equal(this._watchingQuestion.Text, responseModel.Questions[0].Text);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
