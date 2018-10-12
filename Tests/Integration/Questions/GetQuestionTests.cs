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
            var questions = DataHelpers.CreateQuestions(questionUser, 3, answerUser, 3);
            _topic = DataHelpers.CreateTopic(questionUser, isApproved: true, questions: questions.ToArray());
        }

        [Fact]
        public async Task ShouldGetQuestion()
        {
            var question = _topic.Questions.Skip(1).First();

            // Add 2 Comments to each Answer
            foreach (var answer in question.Answers.ToArray())
            {
                DataHelpers.CreateComments(answer, answer.PostedByUser, 2);
            }

            // Add a Reaction to a Comment
            var commentWithReaction = question.Answers.First().Comments.First();
            var reactionType = ReactionType.YouBeTrolling;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(commentWithReaction);
                commentWithReaction.Reactions.Add(new Reaction(reactionType, _questionUserId, DateTimeOffset.UtcNow));
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

                var responseCommentWithReaction = responseModel.Answers.SelectMany(x => x.Comments).Single(x => x.Id == commentWithReaction.Id);
                Assert.Single(responseCommentWithReaction.ReactionCounts);
                Assert.Equal(reactionType.ToString(), responseCommentWithReaction.ReactionCounts.Keys.Single());
                Assert.Equal(1, responseCommentWithReaction.ReactionCounts[reactionType.ToString()]);
                Assert.Single(responseCommentWithReaction.MyReactions);
                Assert.Equal(reactionType.ToString(), responseCommentWithReaction.MyReactions.Single());
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
            foreach (var question in _topic.Questions)
            {
                DataHelpers.DeleteAllComments(question.Id);
            }
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
