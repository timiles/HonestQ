using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class PostAnswerTests : IDisposable
    {
        private string _buildUrl(int questionId) => $"/api/questions/{questionId}/answers";
        private readonly User _watchingUser;
        private readonly User _postingUser;
        private readonly Question _question;

        public PostAnswerTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_postingUser, 1).Single();
            DataHelpers.CreateWatch(_watchingUser.Id, _question);
        }

        [Fact]
        public async Task ShouldCreateNotification()
        {
            var payload = new AnswerFormModel
            {
                Text = "My honest answer",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id);

                var response = await client.PostAsync(_buildUrl(_question.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AnswerModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Notifications.Any(x => x.Answer.Id == responseModel.Id && x.OwnerUser == _watchingUser));
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_postingUser.Id);
            DataHelpers.DeleteUser(_watchingUser.Id);
        }
    }
}
