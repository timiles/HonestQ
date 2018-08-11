using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Statements;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Statements
{
    public class PostStatementsTests : IDisposable
    {
        private readonly string _statementsUrl = $"/api/statements";
        private readonly int _userId;
        private readonly Topic _topic;

        public PostStatementsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user);
        }

        [Fact]
        public async Task Authenticated_RequiredPropertiesOnly_ShouldAddStatement()
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

                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var statement = dbContext.Statements.Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text, statement.Text);
                    Assert.Equal(payload.Type, statement.Type.ToString());
                    Assert.True(statement.PostedAt > DateTime.UtcNow.AddMinutes(-1));

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);

                    Assert.Equal(statement.Id, responseModel.Id);
                    Assert.Equal(statement.Slug, responseModel.Slug);
                    Assert.Equal(statement.Text, responseModel.Text);
                    Assert.Equal(statement.Type.ToString(), responseModel.Type);
                }
            }
        }

        [Fact]
        public async Task AllProperties_ShouldPersist()
        {
            var payload = new StatementFormModel
            {
                // Include emoji in the Text, and quote marks around it
                Text = "\"Here's a poop emoji: 💩\"",
                Source = "https://example.com/💩",
                Type = StatementType.Statement.ToString(),
                TopicSlugs = new[] { _topic.Slug }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var statement = dbContext.Statements
                        .Include(x => x.StatementTopics).ThenInclude(x => x.Topic)
                        .Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text.Trim('"'), statement.Text);
                    Assert.Equal(payload.Source, statement.Source);
                    Assert.Equal(payload.Type, statement.Type.ToString());
                    Assert.Equal("heres_a_poop_emoji", statement.Slug);
                    Assert.Equal(1, statement.Topics.Count);
                    Assert.Equal(_topic.Id, statement.Topics.Single().Id);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);
                    Assert.Equal(statement.Text, responseModel.Text);
                    Assert.Equal(statement.Type.ToString(), responseModel.Type);
                    Assert.Equal("heres_a_poop_emoji", responseModel.Slug);
                    Assert.Single(responseModel.Topics);
                    Assert.Equal(_topic.Name, responseModel.Topics.Single().Name);
                    Assert.Equal(_topic.Slug, responseModel.Topics.Single().Slug);
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new StatementFormModel
            {
                Text = "My insightful statement on this topic",
                Type = StatementType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var statementsExist = dbContext.Statements.Any(x => x.PostedByUser.Id == _userId);
                Assert.False(statementsExist);
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_statementsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Type: " + payload.Type, responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
