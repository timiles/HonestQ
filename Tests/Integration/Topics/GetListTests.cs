using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
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
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(Url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = (dynamic)JsonConvert.DeserializeObject(responseContent);

                var responseTopics = ((JArray)responseModel.topics).ToObject<dynamic[]>().Select(x => new
                {
                    name = (string)x.name,
                    urlFragment = (string)x.urlFragment
                });

                // Check that all of our Topics are in the response. (There may be more too.)
                foreach (var topic in _topics)
                {
                    var responseTopic = responseTopics.FirstOrDefault(x => x.urlFragment == topic.UrlFragment);
                    Assert.NotNull(responseTopic);
                    Assert.Equal(topic.Name, responseTopic.name);
                    Assert.Equal(topic.UrlFragment, responseTopic.urlFragment);
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
