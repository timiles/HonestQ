using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class GetQuestionTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly Topic _topic;

        public GetQuestionTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create 3 questions so we can be sure we get the one we request
            _topic = DataHelpers.CreateTopic(questionUser, 3, answerUser, 3,
                 // commentUser: answerUser, numberOfCommentsPerAnswer: 2,
                 isApproved: true);
        }

        [Fact]
        public async Task ShouldGetQuestion()
        {
            var question = _topic.Questions.Skip(1).First();

            // Add 2 Comments to each Answer
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(question);

                foreach (var answer in question.Answers.ToArray())
                {
                    for (int commentIndex = 0; commentIndex < 2; commentIndex++)
                    {
                        var comment = new Comment(Utils.GenerateRandomString(10), answer.PostedByUser, DateTime.UtcNow, AgreementRating.Neutral, null)
                        {
                            Source = Utils.GenerateRandomString(10),
                        };
                        answer.Comments.Add(comment);
                    }
                }

                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_questionUserId);

                var url = _generateUrl(question.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionModel>(responseContent);
                Assert.Equal(question.Slug, responseModel.Slug);
                Assert.Equal(question.Text, responseModel.Text);
                Assert.Equal(question.Source, responseModel.Source);
                Assert.True(responseModel.IsPostedByLoggedInUser);

                Assert.Single(responseModel.Topics);
                var responseTopic = responseModel.Topics.Single();
                Assert.Equal(_topic.Name, responseTopic.Name);
                Assert.Equal(_topic.Slug, responseTopic.Slug);

                Assert.Equal(3, question.Answers.Count);
                Assert.Equal(question.Answers.Count, responseModel.Answers.Length);

                foreach (var answer in question.Answers)
                {
                    var responseAnswer = responseModel.Answers.Single(x => x.Id == answer.Id);
                    Assert.Equal(answer.Text, responseAnswer.Text);
                    Assert.Equal(answer.Slug, responseAnswer.Slug);
                    Assert.Equal(answer.Source, responseAnswer.Source);
                    Assert.Equal(2, responseAnswer.Comments.Length);
                }
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_questionUserId);

                var url = _generateUrl(0);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteAllComments(_topic.Id);
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
