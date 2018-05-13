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
        private readonly string _url;
        private readonly int _userId;
        private readonly int _topicId;

        public PostOpinionsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topicId = DataHelpers.CreateTopic(user).Id;
            _url = $"/api/topics/{_topicId}/opinions";
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

                var response = await client.PostAsync(_url, payload.ToJsonContent());
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
                var response = await client.PostAsync(_url, payload.ToJsonContent());
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
        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
