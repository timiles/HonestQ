using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostStatementsTests : IDisposable
    {
        private string _generateStatementsUrl(string topicSlug) => $"/api/topics/{topicSlug}/statements";
        private readonly int _userId;
        private readonly int _topicId;
        private readonly string _topicSlug;

        public PostStatementsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            var topic = DataHelpers.CreateTopic(user);
            _topicId = topic.Id;
            _topicSlug = topic.Slug;
        }

        [Fact]
        public async Task Authenticated_ShouldAddStatement()
        {
            var payload = new
            {
                Text = "\"My insightful statement on this topic\"",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateStatementsUrl(_topicSlug);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.PostedByUser)
                        .Single(x => x.Id == _topicId);

                    var statement = topic.Statements.Single();
                    Assert.Equal(payload.Text.Trim('"'), statement.Text);
                    Assert.Equal(_userId, statement.PostedByUser.Id);
                    Assert.True(statement.PostedAt > DateTime.UtcNow.AddMinutes(-1));

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);

                    Assert.Equal(statement.Id, responseModel.Id);
                    Assert.Equal(statement.Slug, responseModel.Slug);
                    Assert.Equal(statement.Text, responseModel.Text);
                }
            }
        }

        [Fact]
        public async Task Emoji_ShouldPersist()
        {
            var payload = new
            {
                Text = "Here's a poop emoji: 💩",
                Source = "https://example.com/💩"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateStatementsUrl(_topicSlug);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.PostedByUser)
                        .Single(x => x.Id == _topicId);

                    var statement = topic.Statements.Single();
                    Assert.Equal(payload.Text, statement.Text);
                    Assert.Equal(payload.Source, statement.Source);
                    Assert.Equal("heres_a_poop_emoji", statement.Slug);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);
                    Assert.Equal(statement.Text, responseModel.Text);
                    Assert.Equal("heres_a_poop_emoji", responseModel.Slug);
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateStatementsUrl(_topicSlug);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                    .Include(x => x.Statements)
                    .Single(x => x.Id == _topicId);

                Assert.Empty(topic.Statements);
            }
        }

        [Fact]
        public async Task UnknownSlug_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateStatementsUrl("INCORRECT_SLUG");
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
