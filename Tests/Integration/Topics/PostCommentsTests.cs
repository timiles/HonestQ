using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostCommentsTests : IDisposable
    {
        private string _generateUrl(string topicUrlFragment, int statementId) =>
            $"/api/topics/{topicUrlFragment}/statements/{statementId}/comments";
        private readonly int _userId;
        private Topic _topic;

        public PostCommentsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            // Create 3 statements so we can be sure we comment on the one we request            
            _topic = DataHelpers.CreateTopic(user, 3);
        }

        [Fact]
        public async Task Authenticated_ShouldAddComment()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;

            var payload = new
            {
                Text = "My insightful comment on this statement"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_topic.UrlFragment, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.Comments)
                            .ThenInclude(x => x.PostedByUser)
                        .Single(x => x.Id == _topic.Id);

                    var statement = topic.Statements.Single(x => x.Id == statementId);
                    var comment = statement.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(_userId, comment.PostedByUser.Id);
                    Assert.True(statement.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentListItemModel>(responseContent);

                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.PostedAt, responseModel.PostedAt);
                    Assert.Equal(comment.PostedByUser.Username, responseModel.PostedByUsername);
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var statementId = _topic.Statements.First().Id;
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_topic.UrlFragment, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.Comments)
                        .Single(x => x.Id == _topic.Id);

                var statement = topic.Statements.Single(x => x.Id == statementId);

                Assert.Empty(statement.Comments);
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

                var url = _generateUrl("INCORRECT_URL_FRAGMENT", _topic.Statements.First().Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownStatementId_ShouldReturnNotFound()
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

                var url = _generateUrl(_topic.UrlFragment, 0);
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
