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
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PutQuestionTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly int _userId;
        private readonly Topic _topic;
        private readonly Topic _topic2;
        private readonly Question _question;

        public PutQuestionTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3);
            _topic2 = DataHelpers.CreateTopic(user);
            _question = _topic.Questions.Skip(1).First();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateQuestion()
        {
            var payload = new QuestionFormModel
            {
                Text = Utils.GenerateRandomString(10),
                Source = Utils.GenerateRandomString(10),
                Topics = new[] { new TopicValueModel { Slug = _topic2.Slug } },
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(slug, responseModel.Slug);

                Assert.Single(responseModel.Topics);
                var responseTopic = responseModel.Topics.Single();
                Assert.Equal(_topic2.Name, responseTopic.Name);
                Assert.Equal(_topic2.Slug, responseTopic.Slug);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var question = dbContext.Questions
                    .Include(x => x.QuestionTopics).ThenInclude(x => x.Topic)
                    .First(x => x.Id == _question.Id);
                Assert.Equal(payload.Text, question.Text);
                Assert.Equal(slug, question.Slug);
                Assert.Equal(payload.Source, question.Source);
                Assert.Single(question.Topics);
                Assert.Equal(_topic2.Id, question.Topics.Single().Id);
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

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("The Text field is required.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidQuestionId_ShouldGetNotFound()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(0), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task NotAuthenticatedAsAdmin_ShouldBeDenied()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics.Find(_topic.Id);
                Assert.Equal(_topic.Slug, topic.Slug);
                Assert.Equal(_topic.Name, topic.Name);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}