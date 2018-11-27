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
    public class PostCommentTests : IDisposable
    {
        private string _buildUrl(Answer answer) => $"/api/questions/{answer.Question.Id}/answers/{answer.Id}/comments";
        private readonly User _watchingUser;
        private readonly User _postingUser;
        private readonly Answer _answer;

        public PostCommentTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
            _answer = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single().Answers.Single();
            DataHelpers.CreateWatch(_watchingUser.Id, _answer);
        }

        [Fact]
        public async Task ShouldCreateNotification()
        {
            var payload = new CommentFormModel
            {
                Text = "My honest comment",
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id);

                var response = await client.PostAsync(_buildUrl(_answer), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Notifications.Any(x => x.Comment.Id == responseModel.Id && x.OwnerUser == _watchingUser));
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
