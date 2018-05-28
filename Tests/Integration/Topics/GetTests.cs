using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class GetTests : IDisposable
    {
        private string _generateTopicUrl(string topicSlug) => $"/api/topics/{topicSlug}";
        private readonly int _userId;
        private readonly Topic _topic;

        public GetTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3);
        }

        [Fact]
        public async Task ShouldGetTopic()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                Assert.Equal(_topic.Name, responseModel.Name);

                Assert.Equal(3, _topic.Statements.Count);
                Assert.Equal(_topic.Statements.Count, responseModel.Statements.Length);

                foreach (var statement in _topic.Statements)
                {
                    var responseStatement = responseModel.Statements.Single(x => x.Id == statement.Id);
                    Assert.Equal(statement.Text, responseStatement.Text);
                }
            }
        }

        [Fact]
        public async Task UnknownSlug_ShouldReturnNotFound()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateTopicUrl("INCORRECT_SLUG");
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
