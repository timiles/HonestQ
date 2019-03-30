using System;
using System.Collections.Generic;
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
    public class PutQuestionTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly int _userId;
        private readonly Question _question;
        private readonly Tag _tag;
        private readonly Tag _differentTag;

        public PutQuestionTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _question = DataHelpers.CreateQuestions(user, questionStatus: PostStatus.AwaitingApproval).Single();
            _tag = DataHelpers.CreateTag(user, questions: _question);
            _differentTag = DataHelpers.CreateTag(user);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldUpdateQuestion()
        {
            var payload = new AdminQuestionFormModel
            {
                Text = Utils.GenerateRandomString(10),
                Context = Utils.GenerateRandomString(10),
                Tags = new[] { new QuestionFormModel.TagValueFormModel { Slug = _differentTag.Slug } },
                IsApproved = true,
            };
            var slug = payload.Text.ToSlug();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionListItemModel>(responseContent);
                Assert.Equal(payload.Text, responseModel.Text);
                Assert.Equal(slug, responseModel.Slug);

                Assert.Single(responseModel.Tags);
                var responseTag = responseModel.Tags.Single();
                Assert.Equal(_differentTag.Name, responseTag.Name);
                Assert.Equal(_differentTag.Slug, responseTag.Slug);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var question = dbContext.Questions
                    .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                    .First(x => x.Id == _question.Id);
                Assert.Equal(payload.Text, question.Text);
                Assert.Equal(slug, question.Slug);
                Assert.Equal(payload.Context, question.Context);
                Assert.Equal(PostStatus.OK, question.Status);

                Assert.Single(question.Tags);
                Assert.Equal(_differentTag.Id, question.Tags.Single().Id);
            }
        }

        [Fact]
        public async Task NoText_ShouldGetBadRequest()
        {
            var payload = new QuestionFormModel
            {
                Text = " ",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("The Text field is required.", responseContent);
            }
        }

        [Fact]
        public async Task InvalidQuestionId_ShouldGetNotFound()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var response = await client.PutAsync(_generateUrl(0), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldBeDenied()
        {
            var payload = new QuestionFormModel
            {
                Text = "My honest question",
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.PutAsync(_generateUrl(_question.Id), payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var reloadedQuestion = dbContext.Questions.Find(_question.Id);
                Assert.Equal(_question.Text, reloadedQuestion.Text);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}