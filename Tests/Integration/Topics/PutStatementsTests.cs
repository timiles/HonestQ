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
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PutStatementsTests : IDisposable
    {
        private string _generateUrl(string topicSlug, int statementId) => $"/api/topics/{topicSlug}/statements/{statementId}";
        private readonly int _userId;
        private readonly Topic _topic;
        private readonly Statement _statement;

        public PutStatementsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3);
            _statement = _topic.Statements.Skip(1).First();
        }

        [Fact(Skip = "Need to remove Statement.TopicId")]
        public async Task AuthenticatedAsAdmin_ShouldUpdateStatement()
        {
            var differentStance = (Stance)(((int)_statement.Stance + 1) % Enum.GetValues(typeof(Stance)).Length);
            var payload = new
            {
                Text = Utils.GenerateRandomString(10),
                Stance = differentStance.ToString(),
                Source = Utils.GenerateRandomString(10),
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, _statement.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(payload.Stance, responseModel.Stance);
                Assert.Equal(slug, responseModel.Slug);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics.Find(_topic.Id);
                dbContext.Entry(topic).Collection(b => b.Statements).Load();

                var statement = topic.Statements.Single(x => x.Id == _statement.Id);
                Assert.Equal(payload.Text, statement.Text);
                Assert.Equal(slug, statement.Slug);
                Assert.Equal(payload.Stance, statement.Stance.ToString());
                Assert.Equal(payload.Source, statement.Source);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new
            {
                Stance = Stance.NA.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, _statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text is required", responseContent);
            }
        }

        [Fact]
        public async Task NoStance_ShouldGetBadRequest()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, _statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Stance is required", responseContent);
            }
        }

        [Fact]
        public async Task InvalidStance_ShouldGetBadRequest()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                Stance = "BLAH",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, _statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Stance: " + payload.Stance, responseContent);
            }
        }

        [Fact]
        public async Task InvalidTopicId_ShouldGetNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                Stance = Stance.NA.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl("UNKNOWN_SLUG", _statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task InvalidStatementId_ShouldGetNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                Stance = Stance.NA.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, 0), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task NotAuthenticatedAsAdmin_ShouldBeDenied()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                Stance = Stance.NA.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PutAsync(_generateUrl(_topic.Slug, _statement.Id), payload.ToJsonContent());
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