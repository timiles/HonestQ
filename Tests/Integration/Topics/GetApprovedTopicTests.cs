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
    public class GetApprovedTopicTests : IDisposable
    {
        private string _generateTopicUrl(string topicSlug) => $"/api/topics/{topicSlug}";
        private readonly User _user;
        private readonly Topic _topic;

        public GetApprovedTopicTests()
        {
            _user = DataHelpers.CreateUser();
            _topic = DataHelpers.CreateTopic(_user, 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetTopic()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_user.Id);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                Assert.Equal(_topic.Slug, responseModel.Slug);
                Assert.Equal(_topic.Name, responseModel.Name);
                Assert.Equal(_topic.Summary, responseModel.Summary);
                Assert.Equal(_topic.MoreInfoUrl, responseModel.MoreInfoUrl);

                var dynamicResponseModel = JsonConvert.DeserializeObject<dynamic>(responseContent);
                Assert.Null(dynamicResponseModel.isApproved);

                Assert.Equal(3, _topic.Pops.Count());
                Assert.Equal(_topic.Pops.Count(), responseModel.Pops.Length);

                foreach (var pop in _topic.Pops)
                {
                    var responsePop = responseModel.Pops.Single(x => x.Id == pop.Id);
                    Assert.Equal(pop.Slug, responsePop.Slug);
                    Assert.Equal(pop.Text, responsePop.Text);
                    Assert.Equal(pop.Type.ToString(), responsePop.Type);

                    Assert.Single(pop.Topics);
                    Assert.Equal(_topic.Id, pop.Topics.Single().Id);
                    Assert.Equal(_topic.Name, pop.Topics.Single().Name);
                }
            }
        }

        [Fact]
        public async Task PopShouldHaveAgreementRatingSummary()
        {
            // Add some Comments to the middle Pop
            var pop = _topic.Pops.Skip(1).First();
            void AddCommentsToPop(AgreementRating agreementRating, int numberOfComments)
            {
                for (int i = 0; i < numberOfComments; i++)
                {
                    pop.Comments.Add(new Comment(Utils.GenerateRandomString(10), _user, DateTime.UtcNow, agreementRating, null));
                }
            };
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_user);
                dbContext.Attach(pop);
                AddCommentsToPop(AgreementRating.Disagree, 4);
                AddCommentsToPop(AgreementRating.Neutral, 5);
                AddCommentsToPop(AgreementRating.Agree, 6);
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_user.Id);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicModel>(responseContent);
                var popResponseModel = responseModel.Pops.Single(x => x.Id == pop.Id);

                Assert.Equal(4, popResponseModel.AgreementRatings[AgreementRating.Disagree.ToString()]);
                Assert.Equal(5, popResponseModel.AgreementRatings[AgreementRating.Neutral.ToString()]);
                Assert.Equal(6, popResponseModel.AgreementRatings[AgreementRating.Agree.ToString()]);
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetIsApprovedProperty()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var url = _generateTopicUrl(_topic.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminTopicModel>(responseContent);
                Assert.Equal(_topic.Slug, responseModel.Slug);
                Assert.Equal(_topic.Name, responseModel.Name);
                Assert.Equal(_topic.IsApproved, responseModel.IsApproved);
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
                client.AuthenticateAs(_user.Id);

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
                client.AuthenticateAs(_user.Id);

                var url = _generateTopicUrl("INCORRECT_SLUG");
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
