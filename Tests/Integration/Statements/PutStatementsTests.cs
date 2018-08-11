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
using Pobs.Web.Models.Statements;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Statements
{
    public class PutStatementsTests : IDisposable
    {
        private string _generateUrl(int statementId) => $"/api/statements/{statementId}";
        private readonly int _userId;
        private readonly Topic _topic;
        private readonly Topic _topic2;
        private readonly Statement _statement;

        public PutStatementsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3);
            _topic2 = DataHelpers.CreateTopic(user);
            _statement = _topic.Statements.Skip(1).First();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateStatement()
        {
            var differentType = (StatementType)(((int)_statement.Type + 1) % Enum.GetValues(typeof(StatementType)).Length);
            var payload = new StatementFormModel
            {
                Text = Utils.GenerateRandomString(10),
                Type = differentType.ToString(),
                Source = Utils.GenerateRandomString(10),
                TopicSlugs = new[] { _topic2.Slug },
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_statement.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(payload.Type, responseModel.Type);
                Assert.Equal(slug, responseModel.Slug);
                Assert.Single(responseModel.Topics);
                Assert.Equal(_topic2.Name, responseModel.Topics.Single().Name);
                Assert.Equal(_topic2.Slug, responseModel.Topics.Single().Slug);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var statement = dbContext.Statements
                    .Include(x => x.StatementTopics).ThenInclude(x => x.Topic)
                    .Single(x => x.Id == _statement.Id);
                Assert.Equal(payload.Text, statement.Text);
                Assert.Equal(slug, statement.Slug);
                Assert.Equal(payload.Type, statement.Type.ToString());
                Assert.Equal(payload.Source, statement.Source);
                Assert.Single(statement.Topics);
                Assert.Equal(_topic2.Id, statement.Topics.Single().Id);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new StatementFormModel
            {
                Type = StatementType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text is required", responseContent);
            }
        }

        [Fact]
        public async Task NoType_ShouldGetBadRequest()
        {
            var payload = new StatementFormModel
            {
                Text = "My insightful statement on this topic",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Type is required", responseContent);
            }
        }

        [Fact]
        public async Task InvalidType_ShouldGetBadRequest()
        {
            var payload = new StatementFormModel
            {
                Text = "My insightful statement on this topic",
                Type = "BLAH",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_statement.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Type: " + payload.Type, responseContent);
            }
        }

        [Fact]
        public async Task InvalidStatementId_ShouldGetNotFound()
        {
            var payload = new StatementFormModel
            {
                Text = "My insightful statement on this topic",
                Type = StatementType.Statement.ToString(),
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
            var payload = new StatementFormModel
            {
                Text = "My insightful statement on this topic",
                Type = StatementType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PutAsync(_generateUrl(_statement.Id), payload.ToJsonContent());
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