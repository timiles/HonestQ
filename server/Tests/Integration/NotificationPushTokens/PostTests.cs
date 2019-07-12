using System;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Notifications;
using Xunit;

namespace Pobs.Tests.Integration.PushTokens
{
    public class PostTests : IDisposable
    {
        private readonly string _url = "/api/notifications/pushtoken";
        private User _user;
        private string _token;

        [Fact]
        public async Task ShouldCreatePushToken()
        {
            _token = Guid.NewGuid().ToString();

            var payload = new PushTokenModel
            {
                Token = _token,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pushToken = dbContext.PushTokens.Find(_token);
                    Assert.NotNull(pushToken);
                    Assert.Null(pushToken.UserId);
                }
            }
        }

        [Fact]
        public async Task AuthenticatedRequest_ShouldCreatePushTokenWithUser()
        {
            _token = Guid.NewGuid().ToString();
            _user = DataHelpers.CreateUser();

            var payload = new PushTokenModel
            {
                Token = _token,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pushToken = dbContext.PushTokens.Find(_token);
                    Assert.NotNull(pushToken);
                    Assert.Equal(_user.Id, pushToken.UserId);
                }
            }
        }

        [Fact]
        public async Task ExistingPushToken_AuthenticatedRequest_ShouldUpdate()
        {
            _token = Guid.NewGuid().ToString();
            _user = DataHelpers.CreateUser();

            DataHelpers.CreatePushToken(_token, null);

            var payload = new PushTokenModel
            {
                Token = _token,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pushToken = dbContext.PushTokens.Find(_token);
                    Assert.NotNull(pushToken);
                    Assert.Equal(_user.Id, pushToken.UserId);
                }
            }
        }

        [Fact]
        public async Task ExistingPushTokenWithUser_UnauthenticatedRequest_ShouldNotUpdate()
        {
            _token = Guid.NewGuid().ToString();
            _user = DataHelpers.CreateUser();

            DataHelpers.CreatePushToken(_token, _user.Id);

            var payload = new PushTokenModel
            {
                Token = _token,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pushToken = dbContext.PushTokens.Find(_token);
                    Assert.NotNull(pushToken);
                    Assert.Equal(_user.Id, pushToken.UserId);
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeletePushToken(_token);
            if (_user != null)
            {
                DataHelpers.DeleteUser(_user.Id);
            }
        }
    }
}
