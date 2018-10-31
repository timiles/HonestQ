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
    public class GetListTests : IDisposable
    {
        private string _generateUrl(bool? isApproved = null) => "/api/topics" + (isApproved.HasValue ? "?isApproved=" + isApproved : "");
        private readonly int _userId;
        private readonly Topic[] _approvedTopics;
        private readonly Topic[] _unapprovedTopics;

        public GetListTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _approvedTopics = new[]
            {
                DataHelpers.CreateTopic(user, isApproved: true),
                DataHelpers.CreateTopic(user, isApproved: true)
            };
            _unapprovedTopics = new[]
            {
                DataHelpers.CreateTopic(user, isApproved: false),
                DataHelpers.CreateTopic(user, isApproved: false)
            };
        }

        [Fact]
        public async Task ShouldGetTopics()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_generateUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicsListModel>(responseContent);

                // Check that all of our Topics are in the response. (There may be more too.)
                foreach (var topic in _approvedTopics)
                {
                    var responseTopic = responseModel.Topics.Single(x => x.Slug == topic.Slug);
                    Assert.Equal(topic.Name, responseTopic.Name);
                    Assert.Equal(topic.Slug, responseTopic.Slug);
                }
                foreach (var topic in _unapprovedTopics)
                {
                    Assert.DoesNotContain(topic.Name, responseModel.Topics.Select(x => x.Name));
                }
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ApprovedFalse_ShouldGetUnapprovedTopics()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.GetAsync(_generateUrl(false));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicsListModel>(responseContent);

                // Check that all of our unapproved Topics are in the response. (There may be more too.)
                foreach (var topic in _unapprovedTopics)
                {
                    var responseTopic = responseModel.Topics.Single(x => x.Slug == topic.Slug);
                    Assert.Equal(topic.Name, responseTopic.Name);
                    Assert.Equal(topic.Slug, responseTopic.Slug);
                }
                foreach (var topic in _approvedTopics)
                {
                    Assert.DoesNotContain(topic.Name, responseModel.Topics.Select(x => x.Name));
                }
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ApprovedFalse_ShouldGetForbidden()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_generateUrl(false));
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        }

        public void Dispose()
        {
            // This cascades to the Topics too
            DataHelpers.DeleteUser(_userId);
        }
    }
}
