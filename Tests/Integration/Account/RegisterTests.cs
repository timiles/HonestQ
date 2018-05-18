using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Newtonsoft.Json;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Pobs.Web.Helpers;
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
            var payload = new
            {
                FirstName = "Mary",
                LastName = "Coffeemug",
                Username = _username,
                Password = "Password1"
            };

            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = (dynamic)JsonConvert.DeserializeObject(responseContent);
                Assert.True(responseModel.id > 0);
                Assert.Equal(payload.FirstName, (string)responseModel.firstName);
                Assert.Equal(payload.LastName, (string)responseModel.lastName);
                Assert.Equal(payload.Username, (string)responseModel.username);

                var token = (string)responseModel.token;
                var decodedToken = new JwtSecurityTokenHandler().ReadJwtToken(token);
                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                Assert.Equal((int)responseModel.id, int.Parse(identityClaim.Value));

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.NotNull(idTokenCookie);
                Assert.Equal(token, idTokenCookie.Value);
                Assert.Equal("/", idTokenCookie.Path);
                Assert.True(idTokenCookie.HttpOnly);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == payload.Username);
                Assert.NotNull(user);

                Assert.Equal(payload.FirstName, user.FirstName);
                Assert.Equal(payload.LastName, user.LastName);
                Assert.Equal(payload.Username, user.Username);

                Assert.True(AuthUtils.VerifyPasswordHash(payload.Password, user.PasswordHash, user.PasswordSalt));
            }
        }

        [Fact]
        public async Task ExistingUsername_ShouldError()
        {
            var payload = new
            {
                FirstName = "Mary",
                LastName = "Coffeemug",
                Username = _username,
                Password = "Password1"
            };

            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response1 = await client.PostAsync(Url, payload.ToJsonContent());
                response1.EnsureSuccessStatusCode();

                var response2 = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

                var responseContent = await response2.Content.ReadAsStringAsync();
                Assert.Equal($"Username '{_username}' is already taken", responseContent);

                var idTokenCookie = response2.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
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
