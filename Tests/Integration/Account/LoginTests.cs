using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Account;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class LoginTests : IDisposable
    {
        private const string Url = "/api/account/login";
        private readonly string _password;
        private readonly User _user;

        public LoginTests()
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
        public async Task CorrectCredentials_ShouldLogin()
        {
            var payload = new
            {
                Username = _user.Username,
                Password = _password
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<LoggedInUserModel>(responseContent);
                Assert.Equal(_user.FirstName, responseModel.FirstName);
                Assert.Equal(_user.Username, responseModel.Username);

                var decodedToken = new JwtSecurityTokenHandler().ReadJwtToken(responseModel.Token);
                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                int.TryParse(identityClaim.Value, out int userId);
                Assert.True(userId > 0);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.NotNull(idTokenCookie);
                Assert.Equal(responseModel.Token, idTokenCookie.Value);
                Assert.Equal("/", idTokenCookie.Path);
                Assert.True(idTokenCookie.HttpOnly);
            }
        }

        [Fact]
        public async Task IncorrectPassword_ShouldBeDenied()
        {
            var payload = new
            {
                Username = _user.Username,
                Password = "WRONG_PASSWORD"
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username or password is incorrect", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
            }
        }

        [Fact]
        public async Task InvalidUsername_ShouldBeDenied()
        {
            var payload = new
            {
                Username = "i_do_not_exist",
                Password = _password
            };
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username or password is incorrect", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
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
