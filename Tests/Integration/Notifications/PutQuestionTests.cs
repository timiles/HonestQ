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
    public class PutQuestionTests : IDisposable
    {
        private string _buildUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly User _watchingUser;
        private readonly User _postingUser;
        private readonly Question _question;
        private readonly Tag _tag;

        public PutQuestionTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_postingUser, 1, questionStatus: PostStatus.AwaitingApproval).Single();
            _tag = DataHelpers.CreateTag(_postingUser);
            DataHelpers.CreateWatch(_watchingUser.Id, _tag);
        }

        [Fact]
        public async Task QuestionApproved_ShouldCreateNotification()
        {
            var payload = new AdminQuestionFormModel
            {
                Text = "My honest question",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } },
                IsApproved = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id, Role.Admin);

                var response = await client.PutAsync(_buildUrl(_question.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Notifications.Any(x => x.Question.Id == responseModel.Id && x.OwnerUser == _watchingUser));
                }
            }
        }

        [Fact]
        public async Task QuestionNotApproved_ShouldNotCreateNotification()
        {
            var payload = new AdminQuestionFormModel
            {
                Text = "My honest question",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } },
                IsApproved = false,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id, Role.Admin);

                var response = await client.PutAsync(_buildUrl(_question.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
                }
            }
        }

        [Fact]
        public async Task QuestionAlreadyApproved_ShouldNotCreateNotification()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_question);
                _question.Status = PostStatus.OK;
                dbContext.SaveChanges();
            }

            var payload = new AdminQuestionFormModel
            {
                Text = "My honest question",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } },
                IsApproved = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_postingUser.Id, Role.Admin);

                var response = await client.PutAsync(_buildUrl(_question.Id), payload.ToJsonContent());
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
