using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Pobs.Domain;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Account;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class RegisterTests : IDisposable
    {
        private const string Url = "/api/account/register";
        private readonly string _username = "mary_coffeemug_" + Utils.GenerateRandomString(10);

        [Fact]
        public async Task ValidInputs_ShouldCreateUser()
        {
            var payload = new RegisterFormModel
            {
                Name = "Mary Coffeemug 💩",
                Email = "mary💩@example.com",
                Username = _username,
                Password = "Password1",
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(1, Role.Admin);

                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == payload.Username);
                Assert.NotNull(user);

                Assert.Equal(payload.Name, user.Name);
                Assert.Equal(payload.Email, user.Email);
                Assert.Equal(payload.Username, user.Username);
                Assert.True(user.CreatedAt > DateTime.UtcNow.AddMinutes(-1));

                Assert.True(AuthUtils.VerifyPasswordHash(payload.Password, user.PasswordHash, user.PasswordSalt));
            }
        }

        [Fact]
        public async Task ExistingUsername_ShouldError()
        {
            var payload = new RegisterFormModel
            {
                Name = "Mary Coffeemug",
                Email = "mary@example.com",
                Username = _username,
                Password = "Password1",
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(1, Role.Admin);

                var response1 = await client.PostAsync(Url, payload.ToJsonContent());
                response1.EnsureSuccessStatusCode();

                var response2 = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

                var responseContent = await response2.Content.ReadAsStringAsync();
                Assert.Equal($"Username '{_username}' is already taken.", responseContent);
            }
        }

        public void Dispose()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == _username);
                if (user != null)
                {
                    dbContext.Users.Remove(user);
                    dbContext.SaveChanges();
                }
            }
        }
    }
}
