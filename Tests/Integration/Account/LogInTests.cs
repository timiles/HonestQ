using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Account;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class LogInTests : IDisposable
    {
        private const string Url = "/api/account/login";
        private readonly string _password;
        private readonly User _user;

        public LogInTests()
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
        public async Task CorrectCredentials_ShouldLogIn()
        {
            var payload = new LogInFormModel
            {
                Username = _user.Username,
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<LoggedInUserModel>(responseContent);
                Assert.Equal(_user.Id, responseModel.Id);
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
                Assert.Null(idTokenCookie.Expires);
            }
        }

        [Fact]
        public async Task LogInWithEmail_ShouldLogIn()
        {
            var payload = new LogInFormModel
            {
                Username = _user.Email,
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<LoggedInUserModel>(responseContent);
                Assert.Equal(_user.Id, responseModel.Id);
                Assert.Equal(_user.Username, responseModel.Username);

                var decodedToken = new JwtSecurityTokenHandler().ReadJwtToken(responseModel.Token);
                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                int.TryParse(identityClaim.Value, out int userId);
                Assert.True(userId > 0);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.NotNull(idTokenCookie);
                Assert.Equal(responseModel.Token, idTokenCookie.Value);
                Assert.Null(idTokenCookie.Expires);
            }
        }

        [Fact]
        public async Task LogInWithEmailUpperCase_ShouldLogIn()
        {
            var payload = new LogInFormModel
            {
                Username = _user.Email.ToUpper(),
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<LoggedInUserModel>(responseContent);
                Assert.Equal(_user.Id, responseModel.Id);
                Assert.Equal(_user.Username, responseModel.Username);

                var decodedToken = new JwtSecurityTokenHandler().ReadJwtToken(responseModel.Token);
                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                int.TryParse(identityClaim.Value, out int userId);
                Assert.True(userId > 0);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.NotNull(idTokenCookie);
                Assert.Equal(responseModel.Token, idTokenCookie.Value);
                Assert.Null(idTokenCookie.Expires);
            }
        }

        [Fact]
        public async Task RememberMe_CookieShouldExpireInFuture()
        {
            var payload = new LogInFormModel
            {
                Username = _user.Username,
                Password = _password,
                RememberMe = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<LoggedInUserModel>(responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.NotNull(idTokenCookie);
                Assert.Equal(responseModel.Token, idTokenCookie.Value);
                Assert.True(idTokenCookie.Expires.HasValue);
                // Cookie should persist for at least a year, in reality it's even more
                Assert.True((idTokenCookie.Expires.Value - DateTime.UtcNow).TotalDays > 365);
            }
        }

        [Fact]
        public async Task UnverifiedEmail_ShouldBeDenied()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(_user.Id);
                user.EmailVerificationToken = "123qwe";
                dbContext.SaveChanges();
            }

            var payload = new LogInFormModel
            {
                Username = _user.Username,
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Please verify your account first.", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
            }
        }

        [Fact]
        public async Task IncorrectPassword_ShouldBeDenied()
        {
            var payload = new LogInFormModel
            {
                Username = _user.Username,
                Password = "WRONG_PASSWORD",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username or password is incorrect.", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
            }
        }

        [Fact]
        public async Task InvalidUsername_ShouldBeDenied()
        {
            var payload = new LogInFormModel
            {
                Username = "i_do_not_exist",
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username or password is incorrect.", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
            }
        }

        [Fact]
        public async Task InvalidEmail_ShouldBeDenied()
        {
            var payload = new LogInFormModel
            {
                Username = "i_do_not_exist@example.com",
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username or password is incorrect.", responseContent);

                var idTokenCookie = response.Headers.GetIdTokenCookie();
                Assert.Null(idTokenCookie);
            }
        }

        [Fact]
        public async Task MissingUsername_ShouldGetBadRequest()
        {
            var payload = new LogInFormModel
            {
                Password = _password,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Username is required.", responseContent);

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
