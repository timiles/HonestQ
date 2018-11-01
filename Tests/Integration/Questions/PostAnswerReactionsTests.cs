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
    public class PostAnswerReactionsTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId, string reactionType) =>
            $"/api/questions/{questionId}/answers/{answerId}/reactions/{reactionType}";
        private string _generateUrl(Answer answer, ReactionType reactionType) =>
            _generateUrl(answer.Question.Id, answer.Id, reactionType.ToString());
        private readonly User _user;
        private readonly User _differentUser;
        private readonly Question _question;
        private readonly Answer _answer;

        public PostAnswerReactionsTests()
        {
            _user = DataHelpers.CreateUser();
            _differentUser = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            _answer = _question.Answers.First();
        }

        [Fact]
        public async Task Authenticated_ShouldAddReaction()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_answer, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedAnswer = dbContext.Questions
                        .SelectMany(x => x.Answers)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _answer.Id);

                    Assert.Single(reloadedAnswer.Reactions);
                    var reloadedReaction = reloadedAnswer.Reactions.Single();
                    Assert.Equal(reactionType, reloadedReaction.Type);
                    Assert.Equal(_user.Id, reloadedReaction.PostedByUserId);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<ReactionModel>(responseContent);

                    Assert.Equal(_answer.Question.Id, responseModel.QuestionId);
                    Assert.Equal(_answer.Id, responseModel.AnswerId);
                    Assert.Null(responseModel.CommentId);
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
                dbContext.Attach(_answer);
                _answer.Reactions.Add(new Reaction(differentReactionType, _user.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_answer, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedAnswer = dbContext.Questions
                        .SelectMany(x => x.Answers)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _answer.Id);

                    var reactionTypes = reloadedAnswer.Reactions.Select(x => x.Type).ToList();
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
                dbContext.Attach(_answer);
                _answer.Reactions.Add(new Reaction(reactionType, _differentUser.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_answer, reactionType);
                var response = await client.PostAsync(url, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedAnswer = dbContext.Questions
                        .SelectMany(x => x.Answers)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _answer.Id);

                    Assert.Equal(2, reloadedAnswer.Reactions.Count(x => x.Type == reactionType));
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
                dbContext.Attach(_answer);
                _answer.Reactions.Add(new Reaction(reactionType, _user.Id, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(_answer, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedAnswer = dbContext.Questions
                        .SelectMany(x => x.Answers)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _answer.Id);

                    Assert.Equal(1, reloadedAnswer.Reactions.Count(x => x.Type == reactionType));
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
                var url = _generateUrl(_answer, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedAnswer = dbContext.Questions
                        .SelectMany(x => x.Answers)
                        .Include(x => x.Reactions)
                        .First(x => x.Id == _answer.Id);

                    Assert.Empty(reloadedAnswer.Reactions);
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

                var url = _generateUrl(0, _answer.Id, ReactionType.ThisMadeMeThink.ToString());
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

                var url = _generateUrl(_answer.Question.Id, 0, ReactionType.ThisMadeMeThink.ToString());
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

                var url = _generateUrl(_answer.Question.Id, _answer.Id, reactionType);
                var response = await client.PostAsync(url, null);
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid ReactionType: {reactionType}.", responseContent);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteAllComments(_question.Id);
            DataHelpers.DeleteUser(_user.Id);
            DataHelpers.DeleteUser(_differentUser.Id);
        }
    }
}
