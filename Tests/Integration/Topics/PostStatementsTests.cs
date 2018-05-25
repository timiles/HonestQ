using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostStatementsTests : IDisposable
    {
        private string _generateStatementsUrl(string topicUrlFragment) => $"/api/topics/{topicUrlFragment}/statements";
        private readonly int _userId;
        private readonly int _topicId;
        private readonly string _topicUrlFragment;

        public PostStatementsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            var topic = DataHelpers.CreateTopic(user);
            _topicId = topic.Id;
            _topicUrlFragment = topic.UrlFragment;
        }

        [Fact]
        public async Task Authenticated_ShouldAddStatement()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateStatementsUrl(_topicUrlFragment);
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
                    Assert.Equal(_userId, statement.PostedByUser.Id);
                    Assert.True(statement.PostedAt > DateTime.UtcNow.AddMinutes(-1));

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<StatementListItemModel>(responseContent);

                    Assert.Equal(statement.Id, responseModel.Id);
                    Assert.Equal(statement.Text, responseModel.Text);
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
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateStatementsUrl(_topicUrlFragment);
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
        public async Task UnknownUrlFragment_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateStatementsUrl("INCORRECT_URL_FRAGMENT");
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
