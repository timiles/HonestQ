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
    public class GetAnswersTests : IDisposable
    {
        private readonly string _url = "/api/watching/answers";

        private readonly int _userId;
        private readonly Question _question;
        private readonly Answer _watchingAnswer;
        private readonly Answer _notWatchingAnswer;

        public GetAnswersTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;

            var question = DataHelpers.CreateQuestions(user, 1, user, 2).Single();
            _question = question;
            var answers = question.Answers.ToArray();
            _watchingAnswer = answers[0];
            DataHelpers.CreateWatch(user.Id, _watchingAnswer);

            _notWatchingAnswer = answers[1];
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
        public async Task ShouldGetWatchingAnswersOnly()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AnswersListModel>(responseContent);

                Assert.Single(responseModel.Answers);
                var responseAnswer = responseModel.Answers[0];
                Assert.Equal(this._watchingAnswer.Id, responseAnswer.Id);
                Assert.Equal(this._watchingAnswer.Text, responseAnswer.Text);
                Assert.Equal(this._question.Id, responseAnswer.QuestionId);
                Assert.Equal(this._question.Text, responseAnswer.QuestionText);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
