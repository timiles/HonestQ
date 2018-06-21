using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class GetApprovedTopicTests : IDisposable
    {
        private string _generateTopicUrl(string topicSlug) => $"/api/topics/{topicSlug}";
        private readonly int _userId;
        private readonly Topic _topic;

        public GetApprovedTopicTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetTopic()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                Assert.Equal(_topic.Slug, responseModel.Slug);
                Assert.Equal(_topic.Name, responseModel.Name);
                Assert.Equal(_topic.Summary, responseModel.Summary);
                Assert.Equal(_topic.MoreInfoUrl, responseModel.MoreInfoUrl);

                Assert.Equal(3, _topic.Statements.Count);
                Assert.Equal(_topic.Statements.Count, responseModel.Statements.Length);

                foreach (var statement in _topic.Statements)
                {
                    var responseStatement = responseModel.Statements.Single(x => x.Id == statement.Id);
                    Assert.Equal(statement.Slug, responseStatement.Slug);
                    Assert.Equal(statement.Text, responseStatement.Text);
                }
            }
        }

        [Fact]
        public async Task IncorrectCasingOnSlug_ShouldGetTopic()
        {
            // First check the Topic slug was created with both upper & lower, or the test doesn't make sense
            Assert.Contains(_topic.Slug, char.IsUpper);
            Assert.Contains(_topic.Slug, char.IsLower);

            // Now switch upper & lower casing
            var slugToRequest = new string(_topic.Slug.Select(c => char.IsUpper(c) ? char.ToLower(c) : char.ToUpper(c)).ToArray());
            Assert.NotEqual(_topic.Slug, slugToRequest);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var url = _generateTopicUrl(slugToRequest);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                // Should still be the correct slug from database
                Assert.Equal(_topic.Slug, responseModel.Slug);
            }
        }

        [Fact]
        public async Task UnknownSlug_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

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
