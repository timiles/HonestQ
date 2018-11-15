using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Tags
{
    public class GetApprovedTagTests : IDisposable
    {
        private string _generateTagUrl(string tagSlug) => $"/api/tags/{tagSlug}";
        private readonly User _user;
        private readonly Question _unapprovedQuestion;
        private readonly Tag _tag;

        public GetApprovedTagTests()
        {
            _user = DataHelpers.CreateUser();
            var questions = DataHelpers.CreateQuestions(_user, 3).ToList();
            _unapprovedQuestion = DataHelpers.CreateQuestions(_user, questionStatus: PostStatus.AwaitingApproval).Single();
            questions.Add(_unapprovedQuestion);
            _tag = DataHelpers.CreateTag(_user, isApproved: true, questions: questions.ToArray());
        }

        [Fact]
        public async Task ShouldGetTag()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateTagUrl(_tag.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagModel>(responseContent);
                Assert.Equal(_tag.Slug, responseModel.Slug);
                Assert.Equal(_tag.Name, responseModel.Name);
                Assert.Equal(_tag.Description, responseModel.Description);
                Assert.Equal(_tag.MoreInfoUrl, responseModel.MoreInfoUrl);

                var dynamicResponseModel = JsonConvert.DeserializeObject<dynamic>(responseContent);
                Assert.Null(dynamicResponseModel.isApproved);

                Assert.Equal(4, _tag.Questions.Count());
                var approvedQuestions = _tag.Questions.Where(x => x.Status == PostStatus.OK);
                Assert.Equal(approvedQuestions.Count(), responseModel.Questions.Length);

                Assert.DoesNotContain(_unapprovedQuestion.Id, responseModel.Questions.Select(x => x.Id));

                foreach (var question in approvedQuestions)
                {
                    var responseQuestion = responseModel.Questions.Single(x => x.Id == question.Id);
                    Assert.Equal(question.Slug, responseQuestion.Slug);
                    Assert.Equal(question.Text, responseQuestion.Text);

                    Assert.Single(question.Tags);
                    Assert.Equal(_tag.Id, question.Tags.Single().Id);
                    Assert.Equal(_tag.Name, question.Tags.Single().Name);
                }
            }
        }

        [Fact]
        public async Task QuestionShouldHaveAnswerCount()
        {
            // Add some Answers to the middle Question
            var question = _tag.Questions.Skip(1).First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_user);
                dbContext.Attach(question);
                for (int i = 0; i < 2; i++)
                {
                    question.Answers.Add(new Answer(Utils.GenerateRandomString(10), _user, DateTime.UtcNow));
                }
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateTagUrl(_tag.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagModel>(responseContent);
                var questionResponseModel = responseModel.Questions.Single(x => x.Id == question.Id);

                Assert.Equal(2, questionResponseModel.AnswersCount);
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetIsApprovedProperty()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id, Role.Admin);

                var url = _generateTagUrl(_tag.Slug);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminTagModel>(responseContent);
                Assert.Equal(_tag.Slug, responseModel.Slug);
                Assert.Equal(_tag.Name, responseModel.Name);
                Assert.Equal(_tag.IsApproved, responseModel.IsApproved);
            }
        }

        [Fact]
        public async Task IncorrectCasingOnSlug_ShouldGetTag()
        {
            // First check the Tag slug was created with both upper & lower, or the test doesn't make sense
            Assert.Contains(_tag.Slug, char.IsUpper);
            Assert.Contains(_tag.Slug, char.IsLower);

            // Now switch upper & lower casing
            var slugToRequest = new string(_tag.Slug.Select(c => char.IsUpper(c) ? char.ToLower(c) : char.ToUpper(c)).ToArray());
            Assert.NotEqual(_tag.Slug, slugToRequest);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateTagUrl(slugToRequest);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagModel>(responseContent);
                // Should still be the correct slug from database
                Assert.Equal(_tag.Slug, responseModel.Slug);
            }
        }

        [Fact]
        public async Task UnknownSlug_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateTagUrl("INCORRECT_SLUG");
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
