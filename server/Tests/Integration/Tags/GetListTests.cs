using System;
using System.Linq;
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
    public class GetListTests : IDisposable
    {
        private string _generateUrl(bool? isApproved = null) => "/api/tags" + (isApproved.HasValue ? "?isApproved=" + isApproved : "");
        private readonly int _userId;
        private readonly Tag[] _approvedTags;
        private readonly Tag[] _unapprovedTags;

        public GetListTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _approvedTags = new[]
            {
                DataHelpers.CreateTag(user, isApproved: true),
                DataHelpers.CreateTag(user, isApproved: true)
            };
            _unapprovedTags = new[]
            {
                DataHelpers.CreateTag(user, isApproved: false),
                DataHelpers.CreateTag(user, isApproved: false)
            };
        }

        [Fact]
        public async Task ShouldGetTags()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_generateUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagsListModel>(responseContent);

                // Check that all of our Tags are in the response. (There may be more too.)
                foreach (var tag in _approvedTags)
                {
                    var responseTag = responseModel.Tags.Single(x => x.Slug == tag.Slug);
                    Assert.Equal(tag.Name, responseTag.Name);
                    Assert.Equal(tag.Slug, responseTag.Slug);
                }
                foreach (var tag in _unapprovedTags)
                {
                    Assert.DoesNotContain(tag.Name, responseModel.Tags.Select(x => x.Name));
                }
            }
        }

        [Fact]
        public async Task WatchingTag_WatchingShouldBeTrue()
        {
            var watchingTag = _approvedTags[0];
            var notWatchingTag = _approvedTags[1];
            DataHelpers.CreateWatch(_userId, watchingTag);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_generateUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagsListModel>(responseContent);

                var responseWatchingTag = responseModel.Tags.Single(x => x.Slug == watchingTag.Slug);
                Assert.True(responseWatchingTag.Watching);

                var responseNotWatchingTag = responseModel.Tags.Single(x => x.Slug == notWatchingTag.Slug);
                Assert.False(responseNotWatchingTag.Watching);
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ApprovedFalse_ShouldGetUnapprovedTags()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.GetAsync(_generateUrl(false));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagsListModel>(responseContent);

                // Check that all of our unapproved Tags are in the response. (There may be more too.)
                foreach (var tag in _unapprovedTags)
                {
                    var responseTag = responseModel.Tags.Single(x => x.Slug == tag.Slug);
                    Assert.Equal(tag.Name, responseTag.Name);
                    Assert.Equal(tag.Slug, responseTag.Slug);
                }
                foreach (var tag in _approvedTags)
                {
                    Assert.DoesNotContain(tag.Name, responseModel.Tags.Select(x => x.Name));
                }
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ApprovedFalse_ShouldGetForbidden()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_generateUrl(false));
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        }

        public void Dispose()
        {
            // This cascades to the Tags too
            DataHelpers.DeleteUser(_userId);
        }
    }
}
