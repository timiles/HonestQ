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
    public class PostQuestionTests : IDisposable
    {
        private readonly string _url = "/api/questions";
        private readonly User _watchingUser;
        private readonly User _postingUser;
        private readonly Tag _tag;

        public PostQuestionTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
            _tag = DataHelpers.CreateTag(_postingUser);
            DataHelpers.CreateWatch(_watchingUser.Id, _tag);
        }

        [Fact]
        public async Task PostingUserIsAdmin_ShouldCreateNotification()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } },
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id, Role.Admin);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Notifications.Any(x => x.Question.Id == responseModel.Id && x.OwnerUser == _watchingUser));
                }
            }
        }

        // This test is because the Question will not be Approved yet.
        [Fact]
        public async Task PostingUserIsNonAdmin_ShouldNotCreateNotification()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } },
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_watchingUser.Id);
            DataHelpers.DeleteUser(_postingUser.Id);
        }
    }
}
