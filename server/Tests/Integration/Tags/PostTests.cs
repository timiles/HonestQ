using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Pobs.Comms;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Tags
{
    public class PostTests : IDisposable
    {
        private const string Url = "/api/tags";
        private readonly User _user;

        public PostTests()
        {
            _user = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldCreateApprovedTag()
        {
            var payload = new TagFormModel
            {
                Name = "Tag (1982) " + Utils.GenerateRandomString(10),
                Description = "This is a quick blurb about the tag",
                MoreInfoUrl = "https://www.example.com/Tag_(1982)"
            };
            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var tag = dbContext.Tags
                    .Include(x => x.PostedByUser)
                    .Include(x => x.Watches)
                    .Single(x => x.PostedByUser.Id == _user.Id);

                Assert.NotNull(tag.Slug);
                Assert.Equal(payload.Name, tag.Name);
                Assert.Equal(payload.Description, tag.Description);
                Assert.Equal(payload.MoreInfoUrl, tag.MoreInfoUrl);
                Assert.Equal(_user.Id, tag.PostedByUser.Id);
                Assert.True(tag.PostedAt > DateTime.UtcNow.AddMinutes(-1));
                Assert.True(tag.IsApproved);
                Assert.NotEmpty(tag.Watches.Where(x => x.UserId == _user.Id));
            }
            emailSenderMock.Verify(
                x => x.SendTagAwaitingApprovalEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
                Times.Never);
        }

        [Fact]
        public async Task Emoji_ShouldPersist()
        {
            var payload = new TagFormModel
            {
                Name = Utils.GenerateRandomString(10) + "💩💩💩",
                Description = "This tag is all about 💩💩💩",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                dbContext.Entry(user).Collection(b => b.Tags).Load();

                var tag = user.Tags.Single();
                Assert.Equal(payload.Name, tag.Name);
                Assert.Equal(payload.Description, tag.Description);
            }
        }

        [Fact]
        public async Task TagSlugAlreadyExistsUnapproved_ShouldBeOK()
        {
            var tag = DataHelpers.CreateTag(_user, isApproved: false);

            var payload = new TagFormModel
            {
                Name = tag.Name
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }
        }

        [Fact]
        public async Task TagSlugAlreadyExistsApproved_ShouldGetBadRequest()
        {
            var tag = DataHelpers.CreateTag(_user, isApproved: true);

            var payload = new TagFormModel
            {
                Name = tag.Name + " 💩", // Extra chars that aren't included in slug
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(Url, payload.ToJsonContent());

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Tag \"{tag.Slug}\" already exists.", responseContent);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldCreateUnapprovedTag()
        {
            var payload = new TagFormModel
            {
                Name = Utils.GenerateRandomString(10),
                Description = "This is a quick blurb about the tag",
                MoreInfoUrl = "https://www.example.com/Tag_(1982)"
            };
            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var tag = dbContext.Tags
                    .Include(x => x.PostedByUser)
                    .Include(x => x.Watches)
                    .Single(x => x.PostedByUser.Id == _user.Id);

                Assert.NotNull(tag.Slug);
                Assert.Equal(payload.Name, tag.Name);
                Assert.Equal(payload.Description, tag.Description);
                Assert.Equal(payload.MoreInfoUrl, tag.MoreInfoUrl);
                Assert.Equal(_user.Id, tag.PostedByUser.Id);
                Assert.True(tag.PostedAt > DateTime.UtcNow.AddMinutes(-1));
                Assert.False(tag.IsApproved);
                Assert.NotEmpty(tag.Watches.Where(x => x.UserId == _user.Id));

                emailSenderMock.Verify(
                    x => x.SendTagAwaitingApprovalEmail("honestq@pm.me", tag.Slug, tag.Name),
                    Times.Once);
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var payload = new TagFormModel
            {
                Name = Utils.GenerateRandomString(10),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                dbContext.Entry(user).Collection(b => b.Tags).Load();

                Assert.Empty(user.Tags);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
