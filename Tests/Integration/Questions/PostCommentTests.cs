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
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PostCommentTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId) => $"/api/questions/{questionId}/answers/{answerId}/comments";
        private readonly User _user;
        private readonly Topic _topic;

        public PostCommentTests()
        {
            var user = DataHelpers.CreateUser();
            _user = user;
            _topic = DataHelpers.CreateTopic(user, 1, user, 1);
        }

        [Fact]
        public async Task Authenticated_ShouldAddComment()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = "Here's a poop emoji: 💩",
                Source = "https://example.com/💩",
                AgreementRating = AgreementRating.Agree.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.PostedByUser)
                        .First(x => x.Id == question.Id);
                    var reloadedAnswer = reloadedQuestion.Answers.First(x => x.Id == answer.Id);
                    var comment = reloadedAnswer.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(payload.Source, comment.Source);
                    Assert.Equal(payload.AgreementRating, comment.AgreementRating.ToString());
                    Assert.Equal(_user.Id, comment.PostedByUser.Id);
                    Assert.True(comment.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

                    Assert.Equal(comment.Id, responseModel.Id);
                    Assert.Equal(comment.Text, responseModel.Text);
                    AssertHelpers.Equal(comment.PostedAt, responseModel.PostedAt, 10);
                    Assert.Equal(0, responseModel.PostedByUserPseudoId);
                    Assert.True(responseModel.IsPostedByLoggedInUser);
                }
            }
        }

        [Fact]
        public async Task SourceOnly_ShouldPersist()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Source = "https://example.com/",
                AgreementRating = AgreementRating.Neutral.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.PostedByUser)
                        .First(x => x.Id == question.Id);
                    var reloadedAnswer = reloadedQuestion.Answers.First(x => x.Id == answer.Id);

                    var comment = reloadedAnswer.Comments.Single();
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
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(answer);
                var comment = new Comment("Parent", _user, DateTimeOffset.UtcNow, AgreementRating.Neutral, null);
                answer.Comments.Add(comment);
                dbContext.SaveChanges();
            }

            var parentComment = answer.Comments.First();
            var payload = new CommentFormModel
            {
                Text = "My insightful child comment on this parent comment",
                AgreementRating = AgreementRating.Agree.ToString(),
                ParentCommentId = parentComment.Id,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.PostedByUser)
                        .First(x => x.Id == question.Id);
                    var reloadedAnswer = reloadedQuestion.Answers.First(x => x.Id == answer.Id);
                    var reloadedParentComment = reloadedAnswer.Comments.First(x => x.Id == parentComment.Id);
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

        [Fact]
        public async Task NoTextAndNoSource_ShouldGetBadRequest()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = " ",
                Source = " ",
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text or Source is required.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidAgreementRating_ShouldGetBadRequest()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = "My insightful comment on this answer",
                AgreementRating = "NotReallySureToBeHonest",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid AgreementRating: {payload.AgreementRating}.", responseContent);
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = "My insightful comment on this answer",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(question.Id, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedQuestion = dbContext.Questions
                        .Include(x => x.Answers).ThenInclude(x => x.Comments)
                        .First(x => x.Id == question.Id);

                Assert.Empty(reloadedQuestion.Answers.First(x => x.Id == answer.Id).Comments);
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = "My insightful comment on this answer",
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(0, answer.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task UnknownAnswerId_ShouldReturnNotFound()
        {
            var question = _topic.Questions.First();
            var answer = question.Answers.First();
            var payload = new CommentFormModel
            {
                Text = "My insightful comment on this answer",
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(question.Id, 0);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteAllComments(_topic.Id);
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}