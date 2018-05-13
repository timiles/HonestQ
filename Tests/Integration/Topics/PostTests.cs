using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Pobs.Domain;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostTests : IDisposable
    {
        private const string Url = "/api/topics";
        private readonly int _userId;

        public PostTests()
        {
            _userId = DataHelpers.CreateUser().Id;
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldCreateTopic()
        {
            var payload = new
            {
                UrlFragment = "Topic_(1984)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_userId);
                dbContext.Entry(user).Collection(b => b.Topics).Load();

                var topic = user.Topics.Single();
                Assert.Equal(payload.UrlFragment, topic.UrlFragment);
                Assert.Equal(payload.Name, topic.Name);
                Assert.Equal(_userId, topic.PostedByUser.Id);
                Assert.True(topic.PostedAt > DateTime.UtcNow.AddMinutes(-1));
            }
        }

        [Fact]
        public async Task NotAuthenticatedAsAdmin_ShouldBeDenied()
        {
            var payload = new
            {
                UrlFragment = "Topic_(1984)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_userId);
                dbContext.Entry(user).Collection(b => b.Topics).Load();

                Assert.Empty(user.Topics);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
