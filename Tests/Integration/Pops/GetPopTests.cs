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
        public async Task ShouldGetPop()
        {
            // Don't get the first, just to be thorough
            var pop = _topic.Pops.Skip(1).First();

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

                Assert.Single(responseModel.Topics);
                Assert.Equal(_topic.Name, responseModel.Topics.Single().Name);
                Assert.Equal(_topic.Slug, responseModel.Topics.Single().Slug);

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
