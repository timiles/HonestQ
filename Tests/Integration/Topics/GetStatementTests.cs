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
    public class GetStatementTests : IDisposable
    {
        private string _generateUrl(string topicUrlFragment, int statementId) =>
            $"/api/topics/{topicUrlFragment}/statements/{statementId}";
        private readonly int _userId;
        private readonly Topic _topic;

        public GetStatementTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            // Create 3 statements so we can be sure we get the one we request
            _topic = DataHelpers.CreateTopic(user, 3);
        }

        [Fact]
        public async Task ShouldGetStatement()
        {
            // Don't get the first, just to be thorough
            var statement = _topic.Statements.Skip(1).First();

            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_topic.UrlFragment, statement.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementModel>(responseContent);
                Assert.Equal(statement.Text, responseModel.Text);
            }
        }

        [Fact]
        public async Task UnknownUrlFragment_ShouldReturnNotFound()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateUrl("INCORRECT_URL_FRAGMENT", _topic.Statements.First().Id);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownStatementId_ShouldReturnNotFound()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_topic.UrlFragment, 0);
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
