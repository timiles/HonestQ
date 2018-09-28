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
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PostAnswerTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}/answers";
        private readonly User _user;
        private readonly Topic _topic;

        public PostAnswerTests()
        {
            var user = DataHelpers.CreateUser();
            _user = user;
            _topic = DataHelpers.CreateTopic(user, 1);
        }

        [Fact]
        public async Task Authenticated_ShouldAddAnswer()
        {
            var question = _topic.Questions.First();
            var payload = new AnswerFormModel
            {
                // Include emoji in the Text, and quote marks around it
                Text = "\"Here's a poop emoji: 💩\"",
                Source = "https://example.com/💩",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers).ThenInclude(x => x.PostedByUser)
                        .First(x => x.Id == question.Id);
                    var answer = reloadedQuestion.Answers.Single();
                    Assert.Equal(payload.Text.Trim('"'), answer.Text);
                    Assert.Equal(payload.Source, answer.Source);
                    Assert.Equal(_user.Id, answer.PostedByUser.Id);
                    Assert.True(answer.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<AnswerModel>(responseContent);

                    Assert.Equal(answer.Id, responseModel.Id);
                    Assert.Equal(answer.Text, responseModel.Text);
                    Assert.Equal(answer.Slug, responseModel.Slug);
                    AssertHelpers.Equal(answer.PostedAt, responseModel.PostedAt, 10);
                    Assert.Equal(0, responseModel.PostedByUserPseudoId);
                    Assert.True(responseModel.IsPostedByLoggedInUser);
                }
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var question = _topic.Questions.First();
            var payload = new AnswerFormModel
            {
                Text = " ",
                Source = "https://example.com/",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("The Text field is required.", responseContent);
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var question = _topic.Questions.First();
            var payload = new AnswerFormModel
            {
                Text = "My insightful answer to this question"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(question.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers)
                        .First(x => x.Id == question.Id);

                Assert.Empty(reloadedQuestion.Answers);
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            var question = _topic.Questions.First();
            var payload = new AnswerFormModel
            {
                Text = "My insightful answer to this question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(0);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}