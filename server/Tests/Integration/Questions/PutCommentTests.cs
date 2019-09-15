using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class PutCommentTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId, long commentId) =>
            $"/api/questions/{questionId}/answers/{answerId}/comments/{commentId}";
        private readonly Question _question;
        private readonly Answer _answer;
        private readonly Comment _comment;

        public PutCommentTests()
        {
            var user = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(user, 1, user, 1).Single();
            _answer = _question.Answers.First();
            _comment = DataHelpers.CreateComments(_answer, user, 1).Single();
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateComment()
        {
            var text = Utils.GenerateRandomString(10);
            var source = Utils.GenerateRandomString(10);
            var payload = new CommentFormModel
            {
                Text = $"  {text}  ",
                Source = $" {source} ",
                IsAgree = false,
            };

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1, Role.Admin);

                var url = _generateUrl(_question.Id, _answer.Id, _comment.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                Assert.Equal(text, responseModel.Text);
                Assert.Equal(source, responseModel.Source);
                Assert.False(responseModel.IsAgree);
                // These properties should not have changed
                Assert.Equal(_comment.PostedByUser.Username, responseModel.PostedBy);
                AssertHelpers.Equal(_comment.PostedAt.UtcDateTime, responseModel.PostedAt, 10);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var question = dbContext.Questions
                    .Include(x => x.Answers).ThenInclude(x => x.Comments)
                    .First(x => x.Id == _question.Id);
                var comment = question.Answers.SelectMany(x => x.Comments).Single(x => x.Id == _comment.Id);
                Assert.Equal(text, comment.Text);
                Assert.Equal(source, comment.Source);
                Assert.Equal(AgreementRating.Disagree, comment.AgreementRating);
                // These properties should not have changed
                Assert.Equal(_comment.PostedByUserId, comment.PostedByUserId);
                AssertHelpers.Equal(_comment.PostedAt, comment.PostedAt, 10);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new CommentFormModel
            {
                Text = " ",
                IsAgree = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1, Role.Admin);

                var url = _generateUrl(_question.Id, _answer.Id, _comment.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Comment Text is required.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidQuestionId_ShouldGetNotFound()
        {
            var payload = new CommentFormModel
            {
                Text = "My honest comment",
                IsAgree = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1, Role.Admin);

                var url = _generateUrl(0, _answer.Id, _comment.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task InvalidAnswerId_ShouldGetNotFound()
        {
            var payload = new CommentFormModel
            {
                Text = "My honest comment",
                IsAgree = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1, Role.Admin);

                var url = _generateUrl(_question.Id, 0, _comment.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task InvalidCommentId_ShouldGetNotFound()
        {
            var payload = new CommentFormModel
            {
                Text = "My honest comment",
                IsAgree = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1, Role.Admin);

                var url = _generateUrl(_question.Id, _answer.Id, 0);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdminPostedByUser_ShouldBeDenied()
        {
            var payload = new CommentFormModel
            {
                Text = "My honest comment",
                IsAgree = true,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_comment.PostedByUserId);

                var url = _generateUrl(_question.Id, _answer.Id, _comment.Id);
                var response = await client.PutAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedQuestion = dbContext.Questions
                    .Include(x => x.Answers).ThenInclude(x => x.Comments)
                    .First(x => x.Id == _question.Id);
                var reloadedComment = reloadedQuestion.Answers.SelectMany(x => x.Comments).Single(x => x.Id == _comment.Id);
                Assert.Equal(_comment.Text, reloadedComment.Text);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_question.PostedByUserId);
        }
    }
}