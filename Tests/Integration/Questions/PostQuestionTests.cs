using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PostQuestionTests : IDisposable
    {
        private readonly string _url = $"/api/questions";
        private readonly int _userId;
        private readonly Tag _tag;

        public PostQuestionTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _tag = DataHelpers.CreateTag(user);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_RequiredPropertiesOnly_ShouldAddQuestion()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var question = dbContext.Questions.Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text, question.Text);
                    Assert.True(question.PostedAt > DateTime.UtcNow.AddMinutes(-1));

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);

                    Assert.Equal(question.Id, responseModel.Id);
                    Assert.Equal(question.Slug, responseModel.Slug);
                    Assert.Equal(question.Text, responseModel.Text);

                    Assert.Equal(PostStatus.OK, question.Status);
                }
            }
        }

        [Fact]
        public async Task AllProperties_ShouldPersist()
        {
            var payload = new QuestionFormModel
            {
                // Include emoji in the Text
                Text = "Here's a poop emoji: 💩",
                Source = "https://example.com/💩",
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _tag.Slug } }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var question = dbContext.Questions
                        .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                        .Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text, question.Text);
                    Assert.Equal(payload.Source, question.Source);
                    Assert.Equal("heres_a_poop_emoji", question.Slug);
                    Assert.Equal(1, question.Tags.Count);
                    Assert.Equal(_tag.Id, question.Tags.Single().Id);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);
                    Assert.Equal(question.Text, responseModel.Text);
                    Assert.Equal("heres_a_poop_emoji", responseModel.Slug);

                    Assert.Single(responseModel.Tags);
                    var responseTag = responseModel.Tags.Single();
                    Assert.Equal(_tag.Name, responseTag.Name);
                    Assert.Equal(_tag.Slug, responseTag.Slug);
                }
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldBeAwaitingApproval()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var question = dbContext.Questions.Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text, question.Text);
                    Assert.True(question.PostedAt > DateTime.UtcNow.AddMinutes(-1));
                    Assert.Equal(PostStatus.AwaitingApproval, question.Status);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    Assert.Empty(responseContent);
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var questionsExist = dbContext.Questions.Any(x => x.PostedByUser.Id == _userId);
                Assert.False(questionsExist);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new QuestionFormModel
            {
                Text = " ",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("The Text field is required.", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
