using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class IndexPopsTests : IDisposable
    {
        private string _generateUrl(string popType) => $"/api/pops" + (popType != null ? "?type=" + popType : "");
        private readonly int _popUserId;
        private readonly int _commentUserId;
        private readonly Topic _topic;

        public IndexPopsTests()
        {
            var popUser = DataHelpers.CreateUser();
            _popUserId = popUser.Id;
            var commentUser = DataHelpers.CreateUser();
            _commentUserId = commentUser.Id;
            // Create multiple pops of different types
            _topic = DataHelpers.CreateTopic(popUser, numberOfPopsPerType: 2,
                commentUser: commentUser, numberOfCommentsPerPop: 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetAllPops()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl(null);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<PopsListModel>(responseContent);
                foreach (var responsePop in responseModel.Pops)
                {
                    var pop = _topic.Pops.FirstOrDefault(x => x.Id == responsePop.Id);
                    if (pop != null)
                    {
                        Assert.Equal(pop.Slug, responsePop.Slug);
                        Assert.Equal(pop.Text, responsePop.Text);
                        Assert.Equal(pop.Type.ToString(), responsePop.Type);
                    }
                }
            }
        }

        [Fact]
        public async Task ShouldFilterPopsByType()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var popType = PopType.Question;
                var url = _generateUrl(popType.ToString());
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<PopsListModel>(responseContent);
                foreach (var responsePop in responseModel.Pops)
                {
                    var pop = _topic.Pops.FirstOrDefault(x => x.Id == responsePop.Id);
                    if (pop != null)
                    {
                        Assert.Equal(pop.Slug, responsePop.Slug);
                        Assert.Equal(pop.Text, responsePop.Text);
                        Assert.Equal(pop.Type.ToString(), responsePop.Type);
                        Assert.Equal(popType.ToString(), responsePop.Type);
                    }
                }
            }
        }

        [Fact]
        public async Task UnknownPopType_ShouldReturnEmptyList()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl("Garbage");
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid Type: Garbage", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_commentUserId);
            DataHelpers.DeleteUser(_popUserId);
        }
    }
}
