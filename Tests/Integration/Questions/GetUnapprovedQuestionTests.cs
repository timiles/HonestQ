using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class GetUnapprovedQuestionTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly int _userId;
        private readonly Question _question;
        private readonly Tag _tag;

        public GetUnapprovedQuestionTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _userId = questionUser.Id;
            _question = DataHelpers.CreateQuestions(questionUser, 1, questionStatus: PostStatus.AwaitingApproval).Single();
            _tag = DataHelpers.CreateTag(questionUser, isApproved: true, questions: _question);
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetTag()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId, Role.Admin);

                var url = _generateUrl(_question.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminQuestionModel>(responseContent);
                Assert.Equal(_question.Slug, responseModel.Slug);
                Assert.Equal(_question.Text, responseModel.Text);
                Assert.Equal(_question.Source, responseModel.Source);
                Assert.Contains(_tag.Slug, responseModel.Tags.Select(x => x.Slug));
                Assert.False(responseModel.IsApproved);
            }
        }

        [Fact]
        public async Task AuthenticatedAsNonAdmin_ShouldGetNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var url = _generateUrl(_question.Id);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
