using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Moq;
using Pobs.Comms;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Account;
using Xunit;

namespace Pobs.Tests.Integration.Account
{
    public class SignUpTests : IDisposable
    {
        private const string Url = "/api/account/signup";
        private readonly string _username = "mary_coffeemug_" + Utils.GenerateRandomString(10);

        [Fact]
        public async Task ValidInputs_ShouldCreateUser()
        {
            var payload = new SignUpFormModel
            {
                Username = _username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == payload.Username);
                Assert.NotNull(user);

                Assert.Equal(payload.Username, user.Username);
                Assert.True(user.CreatedAt > DateTime.UtcNow.AddMinutes(-1));

                Assert.Null(user.Email);
                Assert.Null(user.EmailVerificationToken);
            }
        }

        [Fact]
        public async Task EmailIncluded_ShouldCreateUser()
        {
            var payload = new SignUpFormModel
            {
                Username = _username,
                Password = "Password1",
                Email = Utils.GenerateRandomString(10) + "💩@example.com",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == payload.Username);
                Assert.NotNull(user);

                Assert.Equal(payload.Email, user.Email);
                Assert.NotNull(user.EmailVerificationToken);

                Assert.True(AuthUtils.VerifyPasswordHash(payload.Password, user.PasswordHash, user.PasswordSalt));

                string urlEncodedToken = WebUtility.UrlEncode($"{user.Id}-{user.EmailVerificationToken}");
                string expectedVerificationUrl = $"{TestSetup.AppSettings.Domain}/account/verifyemail?token={urlEncodedToken}";
                emailSenderMock.Verify(x => x.SendEmailVerification(payload.Email, payload.Username, expectedVerificationUrl));
            }
        }

        [Fact]
        public async Task UpperCaseEmail_ShouldStoreLowerCase()
        {
            var lowerCaseEmail = Utils.GenerateRandomString(10) + "💩@example.com".ToLowerInvariant();
            var payload = new SignUpFormModel
            {
                Email = lowerCaseEmail.ToUpperInvariant(),
                Username = _username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.FirstOrDefault(x => x.Username == payload.Username);
                Assert.Equal(lowerCaseEmail, user.Email);

                emailSenderMock.Verify(x => x.SendEmailVerification(lowerCaseEmail, payload.Username, It.IsAny<string>()));
            }
        }

        [Fact]
        public async Task ExistingEmail_ShouldError()
        {
            var payload = new SignUpFormModel
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = _username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response1 = await client.PostAsync(Url, payload.ToJsonContent());
                response1.EnsureSuccessStatusCode();

                emailSenderMock.Reset();

                var payload2 = new SignUpFormModel
                {
                    // Also test case-sensitivity, white space
                    Email = " \t\r\n" + payload.Email.ToUpper() + " \t\r\n",
                    Username = "mary_coffeemug_" + Utils.GenerateRandomString(10),
                    Password = "Password1",
                };
                var response2 = await client.PostAsync(Url, payload2.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

                var responseContent = await response2.Content.ReadAsStringAsync();
                Assert.Equal($"An account already exists for '{payload.Email}'.", responseContent);
            }

            emailSenderMock.Verify(x => x.SendEmailVerification(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Theory]
        [InlineData("invalidemail")]
        [InlineData("invalidemail@")]
        [InlineData("invalidemail@example@example.com")]
        public async Task InvalidEmail_ShouldError(string email)
        {
            var payload = new SignUpFormModel
            {
                Email = email,
                Username = _username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid Email address: '{payload.Email}'.", responseContent);
            }

            emailSenderMock.Verify(x => x.SendEmailVerification(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Theory]
        [InlineData("username@")]
        [InlineData("username@example.com")]
        [InlineData("@username")]
        public async Task InvalidUsername_ShouldError(string username)
        {
            var payload = new SignUpFormModel
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid Username, must not contain '@': '{payload.Username}'.", responseContent);
            }

            emailSenderMock.Verify(x => x.SendEmailVerification(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task ExistingUsername_ShouldError()
        {
            var payload = new SignUpFormModel
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = _username,
                Password = "Password1",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response1 = await client.PostAsync(Url, payload.ToJsonContent());
                response1.EnsureSuccessStatusCode();

                emailSenderMock.Reset();

                var response2 = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

                var responseContent = await response2.Content.ReadAsStringAsync();
                Assert.Equal($"Username '{_username}' is already taken.", responseContent);
            }

            emailSenderMock.Verify(x => x.SendEmailVerification(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task PasswordTooShort_ShouldError()
        {
            var payload = new SignUpFormModel
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = _username,
                Password = "123456",
            };

            var emailSenderMock = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(emailSenderMock.Object))
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(Url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Password must be at least 7 characters.", responseContent);
            }

            emailSenderMock.Verify(x => x.SendEmailVerification(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
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
