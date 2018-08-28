using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class GetPopTests : IDisposable
    {
        private string _generateUrl(int popId) => $"/api/pops/{popId}";
        private readonly int _popUserId;
        private readonly int _commentUserId;
        private readonly Topic _topic;

        public GetPopTests()
        {
            var popUser = DataHelpers.CreateUser();
            _popUserId = popUser.Id;
            var commentUser = DataHelpers.CreateUser();
            _commentUserId = commentUser.Id;
            // Create 3 pops so we can be sure we get the one we request
            _topic = DataHelpers.CreateTopic(popUser, 3,
                commentUser: commentUser, numberOfCommentsPerPop: 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetStatementPop()
        {
            // Get a Statement pop to test that the Stance is populated too
            var pop = _topic.Pops.First(x => x.Type == PopType.Statement);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl(pop.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<PopModel>(responseContent);
                Assert.Equal(pop.Slug, responseModel.Slug);
                Assert.Equal(pop.Text, responseModel.Text);
                Assert.Equal(pop.Source, responseModel.Source);
                Assert.Equal(pop.Type.ToString(), responseModel.Type);
                Assert.True(responseModel.IsPostedByLoggedInUser);

                Assert.Single(responseModel.Topics);
                var responseTopic = responseModel.Topics.Single();
                Assert.Equal(_topic.Name, responseTopic.Name);
                Assert.Equal(_topic.Slug, responseTopic.Slug);
                Assert.Equal(pop.PopTopics.Single().Stance.ToString(), responseTopic.Stance);

                Assert.Equal(3, pop.Comments.Count);
                Assert.Equal(pop.Comments.Count, responseModel.Comments.Length);

                foreach (var comment in pop.Comments)
                {
                    var responseComment = responseModel.Comments.Single(x => x.Id == comment.Id);
                    Assert.Equal(comment.Text, responseComment.Text);
                    Assert.Equal(comment.Source, responseComment.Source);
                    Assert.Equal(comment.AgreementRating.ToString(), responseComment.AgreementRating);
                }
            }
        }

        [Fact]
        public async Task UnknownPopId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl(0);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_commentUserId);
            DataHelpers.DeleteUser(_popUserId);
        }
    }
}
