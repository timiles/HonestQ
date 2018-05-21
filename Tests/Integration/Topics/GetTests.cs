using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class GetTests : IDisposable
    {
        private string _generateTopicUrl(string topicUrlFragment) => $"/api/topics/{topicUrlFragment}";
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
                var url = _generateTopicUrl(_topic.UrlFragment);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = (dynamic)JsonConvert.DeserializeObject(responseContent);
                Assert.Equal(_topic.Name, (string)responseModel.name);

                Assert.Equal(3, _topic.Statements.Count);
                Assert.Equal(_topic.Statements.Count, responseModel.statements.Count);
                var statementTexts = new List<string>();
                foreach (var statement in responseModel.statements)
                {
                    statementTexts.Add((string)statement.text);
                }
                foreach (var statement in _topic.Statements)
                {
                    Assert.Contains(statement.Text, statementTexts);
                }
                Assert.Equal(_topic.Statements.Count, responseModel.statements.Count);
            }
        }

        [Fact]
        public async Task UnknownUrlFragment_ShouldReturnNotFound()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateTopicUrl("INCORRECT_URL_FRAGMENT");
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
