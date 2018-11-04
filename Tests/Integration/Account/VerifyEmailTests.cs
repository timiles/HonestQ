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
    public class VerifyEmailTests : IDisposable
    {
        private const string Url = "/api/account/verifyemail";
        private readonly User _user;

        public VerifyEmailTests()
        {
            _user = new User
            {
                Name = "Mary Coffeemug",
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = "mary_coffeemug_" + Utils.GenerateRandomString(10),
                EmailVerificationToken = "TestVerificationToken123",
            };

            (byte[] passwordSalt, byte[] passwordHash) = AuthUtils.CreatePasswordHash("Password1");
            _user.PasswordSalt = passwordSalt;
            _user.PasswordHash = passwordHash;

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Users.Add(_user);
                dbContext.SaveChanges();
            }
        }

        [Fact]
        public async Task CorrectToken_ShouldVerifyEmail()
        {
            var payload = new VerifyEmailFormModel
            {
                UserId = _user.Id,
                EmailVerificationToken = _user.EmailVerificationToken,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<VerifyEmailResponseModel>(responseContent);
                Assert.Equal(_user.Username, responseModel.Username);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedUser = dbContext.Users.Find(_user.Id);
                // Token should be wiped out
                Assert.Null(reloadedUser.EmailVerificationToken);
            }
        }

        [Fact]
        public async Task AccountAlreadyVerified_ShouldReturnSuccess()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedUser = dbContext.Users.Find(_user.Id);
                reloadedUser.EmailVerificationToken = null;
                dbContext.SaveChanges();
            }

            var payload = new VerifyEmailFormModel
            {
                UserId = _user.Id,
                EmailVerificationToken = "anything",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<VerifyEmailResponseModel>(responseContent);
                // Do not return Username, to guard against enumerating all users.
                Assert.Null(responseModel.Username);
            }
        }

        [Fact]
        public async Task IncorrectToken_ShouldGetBadRequest()
        {
            var payload = new VerifyEmailFormModel
            {
                UserId = _user.Id,
                // Lower case should be rejected.
                EmailVerificationToken = _user.EmailVerificationToken.ToLower(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Invalid email verification token.", responseContent);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedUser = dbContext.Users.Find(_user.Id);
                // Token should not be wiped out
                Assert.NotNull(reloadedUser.EmailVerificationToken);
            }
        }

        [Fact]
        public async Task InvalidUserId_ShouldGetBadRequest()
        {
            var payload = new VerifyEmailFormModel
            {
                UserId = 0,
                EmailVerificationToken = _user.EmailVerificationToken,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Unknown UserId.", responseContent);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedUser = dbContext.Users.Find(_user.Id);
                // Token should not be wiped out
                Assert.NotNull(reloadedUser.EmailVerificationToken);
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
