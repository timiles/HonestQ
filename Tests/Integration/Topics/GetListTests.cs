using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class GetListTests : IDisposable
    {
        private const string Url = "/api/topics";
        private readonly int _userId;
        private readonly Topic[] _topics;

        public GetListTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topics = new[]
            {
                DataHelpers.CreateTopic(user),
                DataHelpers.CreateTopic(user)
            };
        }

        [Fact]
        public async Task ShouldGetTopics()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(Url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicsListModel>(responseContent);

                // Check that all of our Topics are in the response. (There may be more too.)
                foreach (var topic in _topics)
                {
                    var responseTopic = responseModel.Topics.Single(x => x.Slug == topic.Slug);
                    Assert.Equal(topic.Name, responseTopic.Name);
                    Assert.Equal(topic.Slug, responseTopic.Slug);
                }
            }
        }

        public void Dispose()
        {
            // This cascades to the Topics too
            DataHelpers.DeleteUser(_userId);
        }
    }
}
