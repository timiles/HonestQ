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
    public class PutTests : IDisposable
    {
        private string _generateUrl(string tagSlug) => $"/api/tags/{tagSlug}";
        private readonly User _user;
        private readonly Tag _tag;

        public PutTests()
        {
            _user = DataHelpers.CreateUser();
            _tag = DataHelpers.CreateTag(_user);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateTag()
        {
            var payload = new EditTagFormModel
            {
                Slug = "Tag_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Tag (1982)",
                Description = "This is a quick blurb about the tag",
                MoreInfoUrl = "https://www.example.com/Tag_(1982)",
                IsApproved = true
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_tag.Slug), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminTagModel>(responseContent);
                Assert.Equal(payload.Slug, responseModel.Slug);
                Assert.Equal(payload.Name, responseModel.Name);
                Assert.Equal(payload.Description, responseModel.Description);
                Assert.Equal(payload.MoreInfoUrl, responseModel.MoreInfoUrl);
                Assert.Equal(payload.IsApproved, responseModel.IsApproved);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                dbContext.Entry(user).Collection(b => b.Tags).Load();

                var tag = user.Tags.Single();
                Assert.Equal(payload.Slug, tag.Slug);
                Assert.Equal(payload.Name, tag.Name);
                Assert.Equal(payload.Description, tag.Description);
                Assert.Equal(payload.MoreInfoUrl, tag.MoreInfoUrl);
                Assert.Equal(payload.IsApproved, tag.IsApproved);
            }
        }

        [Fact]
        public async Task ApprovedTagSlugAlreadyExists_ShouldGetBadRequest()
        {
            var tagWithSameSlug = DataHelpers.CreateTag(_user, isApproved: true);

            var payload = new EditTagFormModel
            {
                Slug = tagWithSameSlug.Slug,
                Name = "Tag that is being updated"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_tag.Slug), payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Tag \"{tagWithSameSlug.Slug}\" already exists.", responseContent);
            }
        }

        [Fact]
        public async Task UnapprovedTagSlugAlreadyExists_ShouldGetBadRequest()
        {
            var tagWithSameSlug = DataHelpers.CreateTag(_user, isApproved: false);

            var payload = new EditTagFormModel
            {
                Slug = tagWithSameSlug.Slug,
                Name = "Tag that is being updated"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_tag.Slug), payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Unapproved TagId {tagWithSameSlug.Id} already has slug {tagWithSameSlug.Slug}.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidTagId_ShouldGetNotFound()
        {
            var payload = new EditTagFormModel
            {
                Slug = "Tag_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Tag (1982)",
                Description = "This is a quick blurb about the tag",
                MoreInfoUrl = "https://www.example.com/Tag_(1982)",
                IsApproved = true
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PutAsync(_generateUrl("UNKNOWN_SLUG"), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldBeDenied()
        {
            var payload = new EditTagFormModel
            {
                Slug = "Tag_(1982)_" + Utils.GenerateRandomString(10),
                Name = "Tag (1982)"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PutAsync(_generateUrl(_tag.Slug), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var tag = dbContext.Tags.Find(_tag.Id);
                Assert.Equal(_tag.Slug, tag.Slug);
                Assert.Equal(_tag.Name, tag.Name);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
