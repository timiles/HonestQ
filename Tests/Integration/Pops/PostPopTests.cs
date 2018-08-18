using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class PostPopTests : IDisposable
    {
        private readonly string _popsUrl = $"/api/pops";
        private readonly int _userId;
        private readonly Topic _topic;

        public PostPopTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _topic = DataHelpers.CreateTopic(user);
        }

        [Fact]
        public async Task Authenticated_RequiredPropertiesOnly_ShouldAddPop()
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

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pop = dbContext.Pops.Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text, pop.Text);
                    Assert.Equal(payload.Type, pop.Type.ToString());
                    Assert.True(pop.PostedAt > DateTime.UtcNow.AddMinutes(-1));

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<PopListItemModel>(responseContent);

                    Assert.Equal(pop.Id, responseModel.Id);
                    Assert.Equal(pop.Slug, responseModel.Slug);
                    Assert.Equal(pop.Text, responseModel.Text);
                    Assert.Equal(pop.Type.ToString(), responseModel.Type);
                }
            }
        }

        [Fact]
        public async Task AllProperties_ShouldPersist()
        {
            var stance = Stance.Pro;
            var payload = new PopFormModel
            {
                // Include emoji in the Text, and quote marks around it
                Text = "\"Here's a poop emoji: 💩\"",
                Source = "https://example.com/💩",
                Type = PopType.Statement.ToString(),
                Topics = new[] { new TopicStanceModel { Slug = _topic.Slug, Stance = stance.ToString() } }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pop = dbContext.Pops
                        .Include(x => x.PopTopics).ThenInclude(x => x.Topic)
                        .Single(x => x.PostedByUser.Id == _userId);
                    Assert.Equal(payload.Text.Trim('"'), pop.Text);
                    Assert.Equal(payload.Source, pop.Source);
                    Assert.Equal(payload.Type, pop.Type.ToString());
                    Assert.Equal("heres_a_poop_emoji", pop.Slug);
                    Assert.Equal(1, pop.Topics.Count);
                    Assert.Equal(_topic.Id, pop.Topics.Single().Id);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<PopListItemModel>(responseContent);
                    Assert.Equal(pop.Text, responseModel.Text);
                    Assert.Equal(pop.Type.ToString(), responseModel.Type);
                    Assert.Equal("heres_a_poop_emoji", responseModel.Slug);

                    Assert.Single(responseModel.Topics);
                    var responseTopic = responseModel.Topics.Single();
                    Assert.Equal(_topic.Name, responseTopic.Name);
                    Assert.Equal(_topic.Slug, responseTopic.Slug);
                    Assert.Equal(stance.ToString(), responseTopic.Stance);
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Statement.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var popsExist = dbContext.Pops.Any(x => x.PostedByUser.Id == _userId);
                Assert.False(popsExist);
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
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
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Type: " + payload.Type, responseContent);
            }
        }

        [Fact]
        public async Task InvalidStance_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Statement.ToString(),
                Topics = new[] { new TopicStanceModel { Slug = _topic.Slug, Stance = "BLAH" } }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Stance: " + payload.Topics[0].Stance, responseContent);
            }
        }

        [Fact]
        public async Task StatementWithNoStance_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Statement.ToString(),
                Topics = new[] { new TopicStanceModel { Slug = _topic.Slug } }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Stance is required when Type is " + payload.Type, responseContent);
            }
        }

        [Fact]
        public async Task QuestionWithStance_ShouldGetBadRequest()
        {
            var payload = new PopFormModel
            {
                Text = "My insightful pop on this topic",
                Type = PopType.Question.ToString(),
                Topics = new[] { new TopicStanceModel { Slug = _topic.Slug, Stance = Stance.Pro.ToString() } }
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PostAsync(_popsUrl, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Stance is invalid when Type is " + payload.Type, responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
