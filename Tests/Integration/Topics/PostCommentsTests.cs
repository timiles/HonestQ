using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class PostCommentsTests : IDisposable
    {
        private string _generateUrl(string topicSlug, int statementId) =>
            $"/api/topics/{topicSlug}/statements/{statementId}/comments";
        private readonly int _userId;
        private Topic _topic;

        public PostCommentsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            // Create 3 statements so we can be sure we comment on the one we request            
            _topic = DataHelpers.CreateTopic(user, 3);
        }

        [Fact]
        public async Task Authenticated_ShouldAddComment()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;
            var agreementRating = AgreementRating.Agree;
            var payload = new
            {
                Text = "My insightful comment on this statement",
                AgreementRating = agreementRating.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_topic.Slug, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.Comments)
                            .ThenInclude(x => x.PostedByUser)
                        .Single(x => x.Id == _topic.Id);

                    var statement = topic.Statements.Single(x => x.Id == statementId);
                    var comment = statement.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(agreementRating, comment.AgreementRating);
                    Assert.Equal(_userId, comment.PostedByUser.Id);
                    Assert.True(comment.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentListItemModel>(responseContent);

                    Assert.Equal(comment.Id, responseModel.Id);
                    Assert.Equal(comment.Text, responseModel.Text);
                    AssertHelpers.Equal(comment.PostedAt, responseModel.PostedAt, 10);
                    Assert.Equal(comment.PostedByUser.Username, responseModel.PostedByUsername);
                }
            }
        }

        [Fact]
        public async Task Emoji_ShouldPersist()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;
            var payload = new
            {
                Text = "Here's a poop emoji: 💩",
                Source = "https://example.com/💩",
                AgreementRating = AgreementRating.StronglyAgree.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_topic.Slug, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.Comments)
                            .ThenInclude(x => x.PostedByUser)
                        .Single(x => x.Id == _topic.Id);

                    var statement = topic.Statements.Single(x => x.Id == statementId);
                    var comment = statement.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(payload.Source, comment.Source);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentListItemModel>(responseContent);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.Source, responseModel.Source);
                }
            }
        }

        [Fact]
        public async Task InvalidAgreementRating_ShouldGetBadRequest()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;
            var payload = new
            {
                Text = "My insightful comment on this statement",
                AgreementRating = "NotReallySureToBeHonest"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_topic.Slug, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal(responseContent, $"Invalid AgreementRating: {payload.AgreementRating}");
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var statementId = _topic.Statements.First().Id;
            var payload = new
            {
                Text = "My insightful statement on this topic"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_topic.Slug, statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                        .Include(x => x.Statements)
                            .ThenInclude(x => x.Comments)
                        .Single(x => x.Id == _topic.Id);

                var statement = topic.Statements.Single(x => x.Id == statementId);

                Assert.Empty(statement.Comments);
            }
        }

        [Fact]
        public async Task UnknownSlug_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                AgreementRating = AgreementRating.Neutral
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl("INCORRECT_SLUG", _topic.Statements.First().Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownStatementId_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful statement on this topic",
                AgreementRating = AgreementRating.Neutral
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_topic.Slug, 0);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
