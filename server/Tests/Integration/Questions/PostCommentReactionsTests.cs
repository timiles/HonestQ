using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PostCommentReactionsTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId, long commentId, string reactionType) =>
            $"/api/questions/{questionId}/answers/{answerId}/comments/{commentId}/reactions/{reactionType}";
        private string _generateUrl(Comment comment, ReactionType reactionType) =>
            _generateUrl(comment.Answer.Question.Id, comment.Answer.Id, comment.Id, reactionType.ToString());
        private readonly User _user;
        private readonly User _differentUser;
        private readonly Question _question;
        private readonly Comment _comment;

        public PostCommentReactionsTests()
        {
            _user = DataHelpers.CreateUser();
            _differentUser = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            DataHelpers.CreateComments(_question.Answers.First(), _user, 1);
            _comment = _question.Answers.First().Comments.First();
        }

        [Fact]
        public async Task Authenticated_ShouldAddReaction()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedComment = dbContext.Questions
                        .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _comment.Id);

                    Assert.Single(reloadedComment.Reactions);
                    var reloadedReaction = reloadedComment.Reactions.Single();
                    Assert.Equal(reactionType, reloadedReaction.Type);
                    Assert.Equal(_user.Id, reloadedReaction.PostedByUserId);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<ReactionModel>(responseContent);

                    Assert.Equal(_comment.Answer.Question.Id, responseModel.QuestionId);
                    Assert.Equal(_comment.Answer.Id, responseModel.AnswerId);
                    Assert.Equal(_comment.Id, responseModel.CommentId);
                    Assert.Equal(reactionType.ToString(), responseModel.Type);
                    Assert.Equal(1, responseModel.NewCount);
                    Assert.True(responseModel.IsMyReaction);
                }
            }
        }

        [Fact]
        public async Task ExistingDifferentReactionFromSameUser_ShouldAddNewReaction()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            var differentReactionType = ReactionType.YouBeTrolling;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_comment);
                _comment.Reactions.Add(new Reaction(differentReactionType, _user.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedComment = dbContext.Questions
                        .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _comment.Id);

                    var reactionTypes = reloadedComment.Reactions.Select(x => x.Type).ToList();
                    Assert.Contains(reactionType, reactionTypes);
                    Assert.Contains(differentReactionType, reactionTypes);
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<ReactionModel>(responseContent);
                Assert.Equal(reactionType.ToString(), responseModel.Type);
                Assert.Equal(1, responseModel.NewCount);
                Assert.True(responseModel.IsMyReaction);
            }
        }

        [Fact]
        public async Task ExistingSameReactionFromDifferentUser_ShouldAddNewReaction()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_comment);
                _comment.Reactions.Add(new Reaction(reactionType, _differentUser.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedComment = dbContext.Questions
                        .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _comment.Id);

                    Assert.Equal(2, reloadedComment.Reactions.Count(x => x.Type == reactionType));
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<ReactionModel>(responseContent);
                Assert.Equal(reactionType.ToString(), responseModel.Type);
                Assert.Equal(2, responseModel.NewCount);
                Assert.True(responseModel.IsMyReaction);
            }
        }

        [Fact]
        public async Task ExistingSameReactionFromSameUser_ShouldReturnConflict()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_comment);
                _comment.Reactions.Add(new Reaction(reactionType, _user.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedComment = dbContext.Questions
                        .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _comment.Id);

                    Assert.Equal(1, reloadedComment.Reactions.Count(x => x.Type == reactionType));
                }
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_comment, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedComment = dbContext.Questions
                        .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _comment.Id);

                    Assert.Empty(reloadedComment.Reactions);
                }
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(0, _comment.Answer.Id, _comment.Id, ReactionType.ThisMadeMeThink.ToString());
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownAnswerId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment.Answer.Question.Id, 0, _comment.Id, ReactionType.ThisMadeMeThink.ToString());
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownCommentId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment.Answer.Question.Id, _comment.Answer.Id, 0, ReactionType.ThisMadeMeThink.ToString());
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task InvalidReactionType_ShouldGetBadRequest()
        {
            var reactionType = "InvalidType";
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_comment.Answer.Question.Id, _comment.Answer.Id, _comment.Id, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid ReactionType: {reactionType}.", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
            DataHelpers.DeleteUser(_differentUser.Id);
        }
    }
}
