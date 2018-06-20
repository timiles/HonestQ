using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostTests : IDisposable
    {
        private const string Url = "/api/topics";
        private readonly User _user;

        public PostTests()
        {
            _user = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldCreateTopic()
        {
            var payload = new
            {
                Slug = "Topic_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)",
                Summary = "This is a quick blurb about the topic",
                MoreInfoUrl = "https://www.example.com/Topic_(1982)"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                dbContext.Entry(user).Collection(b => b.Topics).Load();

                var topic = user.Topics.Single();
                Assert.Equal(payload.Slug, topic.Slug);
                Assert.Equal(payload.Name, topic.Name);
                Assert.Equal(payload.Summary, topic.Summary);
                Assert.Equal(payload.MoreInfoUrl, topic.MoreInfoUrl);
                Assert.Equal(_user.Id, topic.PostedByUser.Id);
                Assert.True(topic.PostedAt > DateTime.UtcNow.AddMinutes(-1));
                Assert.True(topic.IsApproved);
            }
        }

        [Fact]
        public async Task TopicSlugAlreadyExists_ShouldGetBadRequest()
        {
            var topic = DataHelpers.CreateTopic(_user);

            var payload = new
            {
                Slug = topic.Slug,
                Name = "Another topic with the same url"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"A topic already exists at /{topic.Slug}", responseContent);
            }
        }

        [Fact]
        public async Task NotAuthenticatedAsAdmin_ShouldBeDenied()
        {
            var payload = new
            {
                Slug = "Topic_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                dbContext.Entry(user).Collection(b => b.Topics).Load();

                Assert.Empty(user.Topics);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
