using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Statements;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Statements
{
    public class PostCommentsTests : IDisposable
    {
        private string _generateUrl(int statementId) => $"/api/statements/{statementId}/comments";
        private readonly User _user;
        private readonly Topic _topic;

        public PostCommentsTests()
        {
            var user = DataHelpers.CreateUser();
            _user = user;
            // Create a statement for every Stance
            _topic = DataHelpers.CreateTopic(user, numberOfStatementsPerStance: 1);
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
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var statement = dbContext.Statements
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .FirstOrDefault(x => x.Id == statementId);
                    var comment = statement.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(agreementRating, comment.AgreementRating);
                    Assert.Equal(_user.Id, comment.PostedByUser.Id);
                    Assert.True(comment.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

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
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var statement = dbContext.Statements
                        .Include(x => x.Comments)
                        .FirstOrDefault(x => x.Id == statementId);
                    var comment = statement.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(payload.Source, comment.Source);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.Source, responseModel.Source);
                }
            }
        }

        [Fact]
        public async Task SourceOnly_ShouldPersist()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;
            var payload = new
            {
                Source = "https://example.com/",
                AgreementRating = AgreementRating.Neutral.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var statement = dbContext.Statements
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .Single(x => x.Id == statementId);

                    var comment = statement.Comments.Single();
                    Assert.Null(comment.Text);
                    Assert.Equal(payload.Source, comment.Source);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.Source, responseModel.Source);
                }
            }
        }

        [Fact]
        public async Task ParentCommentId_ShouldPersist()
        {
            var statement = _topic.Statements.Skip(1).First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(statement);
                var comment = new Comment("Parent", _user, DateTimeOffset.UtcNow, AgreementRating.Neutral);
                statement.Comments.Add(comment);
                dbContext.SaveChanges();
            }

            var parentComment = statement.Comments.First();
            var payload = new
            {
                Text = "My insightful child comment on this parent comment",
                ParentCommentId = parentComment.Id,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statement.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedStatement = dbContext.Statements
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .Single(x => x.Id == statement.Id);
                    var reloadedParentComment = reloadedStatement.Comments.Single(x => x.Id == parentComment.Id);
                    var comment = reloadedParentComment.ChildComments.Single();
                    Assert.Equal(payload.Text, comment.Text);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

                    Assert.Equal(comment.Id, responseModel.Id);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(reloadedParentComment.Id, responseModel.ParentCommentId);


                    // Delete the child comment first to not upset foreign key constraints
                    reloadedParentComment.ChildComments.Remove(comment);
                    dbContext.SaveChanges();
                }
            }
        }

        [Theory]
        [InlineData("ProveIt")]
        [InlineData("Question")]
        public async Task Stance_WithAgreementRating_ShouldGetBadRequest(string stance)
        {
            var statement = _topic.Statements.First(x => x.Stance.ToString() == stance);
            var payload = new
            {
                Text = "My insightful response",
                AgreementRating = AgreementRating.Disagree,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statement.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"AgreementRating is invalid when Stance is {stance}", responseContent);
            }
        }

        [Fact]
        public async Task ParentCommentId_WithAgreementRating_ShouldGetBadRequest()
        {
            var statement = _topic.Statements.Skip(1).First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(statement);
                var comment = new Comment("Parent", _user, DateTimeOffset.UtcNow, AgreementRating.Neutral);
                statement.Comments.Add(comment);
                dbContext.SaveChanges();
            }

            var parentComment = statement.Comments.First();
            var agreementRating = AgreementRating.Agree;
            var payload = new
            {
                Text = "My insightful child comment on this parent comment",
                AgreementRating = agreementRating.ToString(),
                ParentCommentId = parentComment.Id,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statement.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("AgreementRating is invalid with ParentCommentId", responseContent);
            }
        }

        [Fact]
        public async Task NoTextAndNoSource_ShouldGetBadRequest()
        {
            var statementId = _topic.Statements.Skip(1).First().Id;
            var payload = new
            {
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text or Source is required", responseContent);
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
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid AgreementRating: {payload.AgreementRating}", responseContent);
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
                var url = _generateUrl(statementId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var statement = dbContext.Statements
                        .Include(x => x.Comments)
                        .Single(x => x.Id == statementId);

                Assert.Empty(statement.Comments);
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
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(0);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}