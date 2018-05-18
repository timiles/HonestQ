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
using Xunit;

namespace Pobs.Tests.Integration.Users
{
    public class AuthenticateTests : IDisposable
    {
        private const string Url = "/api/users/authenticate";
        private readonly string _password;
        private readonly User _user;

        public AuthenticateTests()
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
        public async Task CorrectCredentials_ShouldAuthenticate()
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
                var responseModel = (dynamic)JsonConvert.DeserializeObject(responseContent);
                Assert.True(responseModel.id > 0);
                Assert.Equal(_user.FirstName, (string)responseModel.firstName);
                Assert.Equal(_user.LastName, (string)responseModel.lastName);
                Assert.Equal(_user.Username, (string)responseModel.username);

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
        }

        [Fact]
        public async Task IncorrectPassword_ShouldNotAuthenticate()
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
        public async Task InvalidUsername_ShouldNotAuthenticate()
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
