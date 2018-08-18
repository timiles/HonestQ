using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class PutPopTests : IDisposable
    {
        private string _generateUrl(int popId) => $"/api/pops/{popId}";
        private readonly int _userId;
        private readonly Topic _topic;
        private readonly Topic _topic2;
        private readonly Pop _pop;

        public PutPopTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user, 3);
            _topic2 = DataHelpers.CreateTopic(user);
            _pop = _topic.Pops.Skip(1).First();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdatePop()
        {
            var differentType = (PopType)(((int)_pop.Type + 1) % Enum.GetValues(typeof(PopType)).Length);
            var payload = new PopFormModel
            {
                Text = Utils.GenerateRandomString(10),
                Type = differentType.ToString(),
                Source = Utils.GenerateRandomString(10),
                Topics = new[] { new TopicStanceModel { Slug = _topic2.Slug } },
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_pop.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<PopListItemModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(payload.Type, responseModel.Type);
                Assert.Equal(slug, responseModel.Slug);

                Assert.Single(responseModel.Topics);
                var responseTopic = responseModel.Topics.Single();
                Assert.Equal(_topic2.Name, responseTopic.Name);
                Assert.Equal(_topic2.Slug, responseTopic.Slug);
                Assert.Null(responseTopic.Stance);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var pop = dbContext.Pops
                    .Include(x => x.PopTopics).ThenInclude(x => x.Topic)
                    .Single(x => x.Id == _pop.Id);
                Assert.Equal(payload.Text, pop.Text);
                Assert.Equal(slug, pop.Slug);
                Assert.Equal(payload.Type, pop.Type.ToString());
                Assert.Equal(payload.Source, pop.Source);
                Assert.Single(pop.Topics);
                Assert.Equal(_topic2.Id, pop.Topics.Single().Id);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Type = PopType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_pop.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text is required", responseContent);
            }
        }

        [Fact]
        public async Task NoType_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_pop.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Type is required", responseContent);
            }
        }

        [Fact]
        public async Task InvalidType_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = "BLAH",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_pop.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Type: " + payload.Type, responseContent);
            }
        }

        [Fact]
        public async Task InvalidPopId_ShouldGetNotFound()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(0), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task NotAuthenticatedAsAdmin_ShouldBeDenied()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PutAsync(_generateUrl(_pop.Id), payload.ToJsonContent());
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
            DataHelpers.DeleteUser(_userId);
        }
    }
}