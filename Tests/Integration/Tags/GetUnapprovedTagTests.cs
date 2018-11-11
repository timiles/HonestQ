using System;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Tags
{
    public class GetUnapprovedTagTests : IDisposable
    {
        private string _generateTagUrl(string tagSlug) => $"/api/tags/{tagSlug}";
        private readonly int _userId;
        private readonly Tag _tag;

        public GetUnapprovedTagTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _tag = DataHelpers.CreateTag(user, isApproved: false);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetTag()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateTagUrl(_tag.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminTagModel>(responseContent);
                Assert.Equal(_tag.Slug, responseModel.Slug);
                Assert.Equal(_tag.Name, responseModel.Name);
                Assert.Equal(_tag.Description, responseModel.Description);
                Assert.Equal(_tag.MoreInfoUrl, responseModel.MoreInfoUrl);
                Assert.Equal(_tag.IsApproved, responseModel.IsApproved);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldGetNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateTagUrl(_tag.Slug);
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
