using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PutAnswerTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId) => $"/api/questions/{questionId}/answers/{answerId}";
        private readonly int _userId;
        private readonly Question _question;
        private readonly Answer _answer;

        public PutAnswerTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _question = DataHelpers.CreateQuestions(user, 1, user, 1).Single();
            _answer = _question.Answers.First();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateAnswer()
        {
            var payload = new AnswerFormModel
            {
                Text = Utils.GenerateRandomString(10),
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AnswerModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(slug, responseModel.Slug);
                Assert.Equal(_answer.PostedByUser.Username, responseModel.PostedBy);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var question = dbContext.Questions
                    .Include(x => x.Answers)
                    .First(x => x.Id == _question.Id);
                var answer = question.Answers.Single();
                Assert.Equal(_answer.Id, answer.Id);
                Assert.Equal(payload.Text, answer.Text);
                Assert.Equal(slug, answer.Slug);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new AnswerFormModel
            {
                Text = " ",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("The Text field is required.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidQuestionId_ShouldGetNotFound()
        {
            var payload = new AnswerFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateUrl(0, _answer.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task InvalidAnswerId_ShouldGetNotFound()
        {
            var payload = new AnswerFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateUrl(_question.Id, 0);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldBeDenied()
        {
            var payload = new AnswerFormModel
            {
                Text = "My honest answer",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedQuestion = dbContext.Questions.Include(x => x.Answers).First(x => x.Id == _question.Id);
                var reloadedAnswer = reloadedQuestion.Answers.Single(x => x.Id == _answer.Id);
                Assert.Equal(_answer.Text, reloadedAnswer.Text);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}