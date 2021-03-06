using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Watching;
using Xunit;

namespace Pobs.Tests.Integration.Watching
{
    public class PostWatchQuestionTests : IDisposable
    {
        private string _buildUrl(int questionId) => $"/api/questions/{questionId}/watch";
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
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_question.Id);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var watchingQuestionModel = JsonConvert.DeserializeObject<WatchingQuestionListItemModel>(responseContent);
                Assert.Equal(_question.Id, watchingQuestionModel.QuestionId);
                Assert.Equal(_question.Slug, watchingQuestionModel.QuestionSlug);
                Assert.Equal(_question.Text, watchingQuestionModel.QuestionText);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var watch = dbContext.Watches.First(x => x.UserId == _user.Id && x.QuestionId == _question.Id);
                    Assert.Equal(watch.Id, watchingQuestionModel.WatchId);
                }
            }
        }

        [Fact]
        public async Task Add_AlreadyWatching_ShouldReturnConflict()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { QuestionId = _question.Id });
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_question.Id);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

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

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_question.Id);
                var response = await client.DeleteAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var watchModel = JsonConvert.DeserializeObject<WatchResponseModel>(responseContent);
                Assert.False(watchModel.Watching);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.False(dbContext.Watches.Any(x => x.UserId == _user.Id && x.QuestionId == _question.Id));
                }
            }
        }

        [Fact]
        public async Task Remove_NotWatching_ShouldReturnBadRequest()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(_question.Id);
                var response = await client.DeleteAsync(url);
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
        public async Task Add_NotAuthenticated_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _buildUrl(_question.Id);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task Remove_NotAuthenticated_ShouldBeDenied()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _buildUrl(_question.Id);
                var response = await client.DeleteAsync(url);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task Add_UnknownQuestionId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(0);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task Add_UnknownQuestionId_ShouldReturnBadRequest()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _buildUrl(0);
                var response = await client.DeleteAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
