using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PutTests : IDisposable
    {
        private string _generateUrl(string topicSlug) => $"/api/topics/{topicSlug}";
        private readonly User _user;
        private readonly Topic _topic;

        public PutTests()
        {
            _user = DataHelpers.CreateUser();
            _topic = DataHelpers.CreateTopic(_user);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateTopic()
        {
            var payload = new
            {
                Slug = "Topic_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)",
                Summary = "This is a quick blurb about the topic",
                MoreInfoUrl = "https://www.example.com/Topic_(1982)",
                IsApproved = true
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminTopicModel>(responseContent);
                Assert.Equal(payload.Slug, responseModel.Slug);
                Assert.Equal(payload.Name, responseModel.Name);
                Assert.Equal(payload.Summary, responseModel.Summary);
                Assert.Equal(payload.MoreInfoUrl, responseModel.MoreInfoUrl);
                Assert.Equal(payload.IsApproved, responseModel.IsApproved);
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
                Assert.Equal(payload.IsApproved, topic.IsApproved);
            }
        }

        [Fact]
        public async Task ApprovedTopicSlugAlreadyExists_ShouldGetBadRequest()
        {
            var topicWithSameSlug = DataHelpers.CreateTopic(_user, isApproved: true);

            var payload = new
            {
                Slug = topicWithSameSlug.Slug,
                Name = "Topic that is being updated"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug), payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"A topic already exists at /{topicWithSameSlug.Slug}", responseContent);
            }
        }

        [Fact]
        public async Task UnapprovedTopicSlugAlreadyExists_ShouldGetBadRequest()
        {
            var topicWithSameSlug = DataHelpers.CreateTopic(_user, isApproved: false);

            var payload = new
            {
                Slug = topicWithSameSlug.Slug,
                Name = "Topic that is being updated"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_topic.Slug), payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Unapproved TopicId {topicWithSameSlug.Id} already has slug {topicWithSameSlug.Slug}", responseContent);
            }
        }

        [Fact]
        public async Task InvalidTopicId_ShouldGetNotFound()
        {
            var payload = new
            {
                Slug = "Topic_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Topic (1982)",
                Summary = "This is a quick blurb about the topic",
                MoreInfoUrl = "https://www.example.com/Topic_(1982)",
                IsApproved = true
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl("UNKNOWN_SLUG"), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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

                var response = await client.PutAsync(_generateUrl(_topic.Slug), payload.ToJsonContent());
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
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
