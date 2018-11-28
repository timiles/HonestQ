using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Notifications;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class PostWatchTagTests : IDisposable
    {
        private string _buildUrl(string tagSlug) => $"/api/tags/{tagSlug}/watch";
        private readonly User _user;
        private readonly Tag _tag;

        public PostWatchTagTests()
        {
            _user = DataHelpers.CreateUser();
            _tag = DataHelpers.CreateTag(_user);
        }

        [Fact]
        public async Task Add_ShouldAddWatch()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_tag.Slug);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var watchModel = JsonConvert.DeserializeObject<WatchResponseModel>(responseContent);
                Assert.True(watchModel.IsWatchedByLoggedInUser);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Watches.Any(x => x.UserId == _user.Id && x.TagId == _tag.Id));
                }
            }
        }

        [Fact]
        public async Task Add_AlreadyWatching_ShouldReturnConflict()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { TagId = _tag.Id });
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_tag.Slug);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Watch already exists.", responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Watches.Any(x => x.UserId == _user.Id && x.TagId == _tag.Id));
                }
            }
        }

        [Fact]
        public async Task Remove_ShouldRemoveWatch()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { TagId = _tag.Id });
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_tag.Slug);
                var response = await client.DeleteAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var watchModel = JsonConvert.DeserializeObject<WatchResponseModel>(responseContent);
                Assert.False(watchModel.IsWatchedByLoggedInUser);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.False(dbContext.Watches.Any(x => x.UserId == _user.Id && x.TagId == _tag.Id));
                }
            }
        }

        [Fact]
        public async Task Remove_NotWatching_ShouldReturnBadRequest()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_tag.Slug);
                var response = await client.DeleteAsync(url);
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Watch does not exist.", responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.False(dbContext.Watches.Any(x => x.UserId == _user.Id && x.TagId == _tag.Id));
                }
            }
        }

        [Fact]
        public async Task Add_NotAuthenticated_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _buildUrl(_tag.Slug);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task Remove_NotAuthenticated_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _buildUrl(_tag.Slug);
                var response = await client.DeleteAsync(url);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task Add_UnknownTagSlug_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl("herpyderp");
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task Remove_UnknownTagSlug_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl("herpyderp");
                var response = await client.DeleteAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
