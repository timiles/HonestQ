using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostOpinionsTests : IDisposable
    {
        private string _generateOpinionsUrl(string topicUrlFragment) => $"/api/topics/{topicUrlFragment}/opinions";
        private readonly int _userId;
        private readonly int _topicId;
        private readonly string _topicUrlFragment;

        public PostOpinionsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            var topic = DataHelpers.CreateTopic(user);
            _topicId = topic.Id;
            _topicUrlFragment = topic.UrlFragment;
        }

        [Fact]
        public async Task Authenticated_ShouldAddOpinion()
        {
            var payload = new
            {
                Text = "My insightful opinion on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateOpinionsUrl(_topicUrlFragment);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                    .Include(x => x.Opinions)
                        .ThenInclude(x => x.PostedByUser)
                    .Single(x => x.Id == _topicId);

                var opinion = topic.Opinions.Single();
                Assert.Equal(payload.Text, opinion.Text);
                Assert.Equal(_userId, opinion.PostedByUser.Id);
                Assert.True(opinion.PostedAt > DateTime.UtcNow.AddMinutes(-1));
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new
            {
                Text = "My insightful opinion on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateOpinionsUrl(_topicUrlFragment);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                    .Include(x => x.Opinions)
                    .Single(x => x.Id == _topicId);

                Assert.Empty(topic.Opinions);
            }
        }

        [Fact]
        public async Task UnknownUrlFragment_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful opinion on this topic"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateOpinionsUrl("INCORRECT_URL_FRAGMENT");
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
