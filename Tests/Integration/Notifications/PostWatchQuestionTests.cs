using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Notifications;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class PostWatchQuestionTests : IDisposable
    {
        private readonly string _url = "/api/notifications/watch";
        private readonly User _user;
        private readonly Question _question;
        private readonly Answer _answer;

        public PostWatchQuestionTests()
        {
            _user = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            _answer = _question.Answers.Single();
        }

        [Fact]
        public async Task Add_ShouldAddWatch()
        {
            var payload = new WatchFormModel
            {
                Method = "Add",
                Type = WatchType.Question.ToString(),
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Watches.Any(x => x.UserId == _user.Id && x.QuestionId == _question.Id));
                }
            }
        }

        [Fact]
        public async Task Add_AlreadyWatching_ShouldReturnBadRequest()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { QuestionId = _question.Id });
                dbContext.SaveChanges();
            }

            var payload = new WatchFormModel
            {
                Method = "Add",
                Type = WatchType.Question.ToString(),
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Watch already exists.", responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Watches.Any(x => x.UserId == _user.Id && x.QuestionId == _question.Id));
                }
            }
        }

        [Fact]
        public async Task Remove_ShouldRemoveWatch()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { QuestionId = _question.Id });
                dbContext.SaveChanges();
            }

            var payload = new WatchFormModel
            {
                Method = "Remove",
                Type = WatchType.Question.ToString(),
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.False(dbContext.Watches.Any(x => x.UserId == _user.Id && x.QuestionId == _question.Id));
                }
            }
        }

        [Fact]
        public async Task Remove_NotWatching_ShouldReturnBadRequest()
        {
            var payload = new WatchFormModel
            {
                Method = "Remove",
                Type = WatchType.Question.ToString(),
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Watch does not exist.", responseContent);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.False(dbContext.Watches.Any(x => x.UserId == _user.Id && x.QuestionId == _question.Id));
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_url, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task Add_UnknownQuestionId_ShouldReturnBadRequest()
        {
            var payload = new WatchFormModel
            {
                Method = "Add",
                Type = WatchType.Question.ToString(),
                Id = 0,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Watchable entity not found.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidMethod_ShouldGetBadRequest()
        {
            var payload = new WatchFormModel
            {
                Method = "Blah",
                Type = WatchType.Question.ToString(),
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid Method: {payload.Method}.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidType_ShouldGetBadRequest()
        {
            var payload = new WatchFormModel
            {
                Method = "Add",
                Type = "Foo",
                Id = _question.Id,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var response = await client.PostAsync(_url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid Type: {payload.Type}.", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
