using System;
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
    public class GetUnapprovedTopicTests : IDisposable
    {
        private string _generateTopicUrl(string topicSlug) => $"/api/topics/{topicSlug}";
        private readonly int _userId;
        private readonly Topic _topic;

        public GetUnapprovedTopicTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, isApproved: false);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetTopic()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                Assert.Equal(_topic.Slug, responseModel.Slug);
                Assert.Equal(_topic.Name, responseModel.Name);
                Assert.Equal(_topic.Summary, responseModel.Summary);
                Assert.Equal(_topic.MoreInfoUrl, responseModel.MoreInfoUrl);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldGetNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
