using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class LogoutTests : IDisposable
    {
        private const string LoginUrl = "/api/account/login";
        private const string LogoutUrl = "/api/account/logout";
        private readonly string _password;
        private readonly User _user;

        public LogoutTests()
        {
            _password = "Password1";
            _user = new User
            {
                FirstName = "Mary",
                LastName = "Coffeemug",
                Username = "mary_coffeemug_" + Utils.GenerateRandomString(10)
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
        public async Task LoggedIn_ShouldLogout()
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
                var response = await client.PostAsync(LoginUrl, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
                Assert.NotNull(response.Headers.GetIdTokenCookie());

                // Now log out and check cookie is removed
                var logoutResponse = await client.PostAsync(LogoutUrl, null);
                logoutResponse.EnsureSuccessStatusCode();
                var idTokenCookie = logoutResponse.Headers.GetIdTokenCookie();
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
