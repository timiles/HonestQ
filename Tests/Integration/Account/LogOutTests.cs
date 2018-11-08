using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class LogOutTests : IDisposable
    {
        private const string LogInUrl = "/api/account/login";
        private const string LogOutUrl = "/api/account/logout";
        private readonly string _password;
        private readonly User _user;

        public LogOutTests()
        {
            _password = "Password1";
            _user = new User
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = "mary_coffeemug_" + Utils.GenerateRandomString(10),
            };

            (byte[] passwordSalt, byte[] passwordHash) = AuthUtils.CreatePasswordHash(_password);
            _user.PasswordSalt = passwordSalt;
            _user.PasswordHash = passwordHash;

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Users.Add(_user);
                dbContext.SaveChanges();
            }
        }

        [Fact]
        public async Task LoggedIn_ShouldLogOut()
        {
            var payload = new
            {
                Username = _user.Username,
                Password = _password
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // First log in to get the cookie
                var response = await client.PostAsync(LogInUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
                Assert.NotNull(response.Headers.GetIdTokenCookie());

                // Now log out and check cookie is removed
                var logOutResponse = await client.PostAsync(LogOutUrl, null);
                logOutResponse.EnsureSuccessStatusCode();
                var idTokenCookie = logOutResponse.Headers.GetIdTokenCookie();
                // Expires is probably 1 Jan 1970, but as long as it's in the past that's ok
                Assert.True(idTokenCookie.Expires < DateTime.UtcNow);
            }
        }

        public void Dispose()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == _user.Username);
                if (user != null)
                {
                    dbContext.Users.Remove(user);
                    dbContext.SaveChanges();
                }
            }
        }
    }
}
