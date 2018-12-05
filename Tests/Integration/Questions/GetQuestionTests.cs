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
    public class GetQuestionTests : IDisposable
    {
        private string _generateUrl(int questionId) => $"/api/questions/{questionId}";
        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly Tag _tag;

        public GetQuestionTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create 3 questions so we can be sure we get the one we request
            var questions = DataHelpers.CreateQuestions(questionUser, 3, answerUser, 3);
            _tag = DataHelpers.CreateTag(questionUser, isApproved: true, questions: questions.ToArray());
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetQuestion()
        {
            var question = _tag.Questions.Skip(1).First();

            // Add 2 Comments to each Answer
            foreach (var answer in question.Answers.ToArray())
            {
                DataHelpers.CreateComments(answer, answer.PostedByUser, 2);
            }

            // Add an unapproved Comment
            var unapprovedComment = DataHelpers.CreateComments(
                question.Answers.First(), question.PostedByUser, 1, PostStatus.AwaitingApproval).Single();

            // Add an unapproved Child Comment
            var unapprovedChildComment = DataHelpers.CreateChildComments(
                question.Answers.First().Comments.First(), question.PostedByUser, 1, PostStatus.AwaitingApproval).Single();

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(question.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionModel>(responseContent);
                Assert.Equal(question.Slug, responseModel.Slug);
                Assert.Equal(question.Text, responseModel.Text);
                Assert.Equal(question.Source, responseModel.Source);
                Assert.Equal(question.PostedByUser.Username, responseModel.PostedBy);

                Assert.Single(responseModel.Tags);
                var responseTag = responseModel.Tags.Single();
                Assert.Equal(_tag.Name, responseTag.Name);
                Assert.Equal(_tag.Slug, responseTag.Slug);

                Assert.Equal(3, question.Answers.Count);
                Assert.Equal(question.Answers.Count, responseModel.Answers.Length);

                var commentWithUnapprovedComment = responseModel.Answers.Single(x => x.Id == unapprovedChildComment.Answer.Id)
                    .Comments.Single(x => x.Id == unapprovedChildComment.ParentComment.Id);
                Assert.DoesNotContain(unapprovedChildComment.Id, commentWithUnapprovedComment.Comments.Select(x => x.Id));

                var answerWithUnapprovedComment = responseModel.Answers.Single(x => x.Id == unapprovedComment.Answer.Id);
                Assert.DoesNotContain(unapprovedComment.Id, answerWithUnapprovedComment.Comments.Select(x => x.Id));

                foreach (var answer in question.Answers)
                {
                    var responseAnswer = responseModel.Answers.Single(x => x.Id == answer.Id);
                    Assert.Equal(answer.Text, responseAnswer.Text);
                    Assert.Equal(answer.Slug, responseAnswer.Slug);
                    Assert.Equal(answer.Source, responseAnswer.Source);
                    Assert.Equal(answer.PostedByUser.Username, responseAnswer.PostedBy);
                    Assert.Equal(2, responseAnswer.Comments.Length);
                }
            }
        }

        [Fact]
        public async Task Authenticated_ShouldGetQuestionWithMyReactions()
        {
            var question = _tag.Questions.Skip(1).First();

            // Add 2 Comments to each Answer
            foreach (var answer in question.Answers.ToArray())
            {
                DataHelpers.CreateComments(answer, answer.PostedByUser, 2);
            }

            // Add a Reaction to an Answer
            var answerWithReaction = question.Answers.First();
            var answerReactionType = ReactionType.ThisMadeMeThink;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(answerWithReaction);
                answerWithReaction.Reactions.Add(new Reaction(answerReactionType, _questionUserId, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            // Add a Reaction to a Comment
            var commentWithReaction = question.Answers.First().Comments.First();
            var commentReactionType = ReactionType.YouBeTrolling;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(commentWithReaction);
                commentWithReaction.Reactions.Add(new Reaction(commentReactionType, _questionUserId, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_questionUserId);

                var url = _generateUrl(question.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionModel>(responseContent);
                Assert.Equal(question.Slug, responseModel.Slug);
                Assert.Equal(question.Text, responseModel.Text);
                Assert.Equal(question.Source, responseModel.Source);
                Assert.Equal(question.PostedByUser.Username, responseModel.PostedBy);

                Assert.Single(responseModel.Tags);
                Assert.Equal(3, question.Answers.Count);

                var responseAnswerWithReaction = responseModel.Answers.Single(x => x.Id == answerWithReaction.Id);
                Assert.Single(responseAnswerWithReaction.ReactionCounts);
                Assert.Equal(answerReactionType.ToString(), responseAnswerWithReaction.ReactionCounts.Keys.Single());
                Assert.Equal(1, responseAnswerWithReaction.ReactionCounts[answerReactionType.ToString()]);
                Assert.Single(responseAnswerWithReaction.MyReactions);
                Assert.Equal(answerReactionType.ToString(), responseAnswerWithReaction.MyReactions.Single());

                var responseCommentWithReaction = responseModel.Answers.SelectMany(x => x.Comments).Single(x => x.Id == commentWithReaction.Id);
                Assert.Single(responseCommentWithReaction.ReactionCounts);
                Assert.Equal(commentReactionType.ToString(), responseCommentWithReaction.ReactionCounts.Keys.Single());
                Assert.Equal(1, responseCommentWithReaction.ReactionCounts[commentReactionType.ToString()]);
                Assert.Single(responseCommentWithReaction.MyReactions);
                Assert.Equal(commentReactionType.ToString(), responseCommentWithReaction.MyReactions.Single());
            }
        }

        [Fact]
        public async Task Authenticated_ShouldGetQuestionWithWatchingCounts()
        {
            var watchedQuestion = _tag.Questions.Skip(1).First();
            DataHelpers.CreateWatch(_questionUserId, watchedQuestion);

            // Add 2 Comments to each Answer
            foreach (var answer in watchedQuestion.Answers.ToArray())
            {
                DataHelpers.CreateComments(answer, answer.PostedByUser, 2);
            }

            // Watch an Answer
            var watchedAnswer = watchedQuestion.Answers.First();
            DataHelpers.CreateWatch(_questionUserId, watchedAnswer);

            // Watch a Comment
            var watchedComment = watchedQuestion.Answers.First().Comments.First();
            DataHelpers.CreateWatch(_questionUserId, watchedComment);

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_questionUserId);

                var url = _generateUrl(watchedQuestion.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionModel>(responseContent);
                Assert.Equal(watchedQuestion.Slug, responseModel.Slug);
                Assert.True(responseModel.Watching);

                var responseWatchedAnswer = responseModel.Answers.Single(x => x.Id == watchedAnswer.Id);
                Assert.True(responseWatchedAnswer.Watching);

                var responseWatchedComment = responseModel.Answers.SelectMany(x => x.Comments).Single(x => x.Id == watchedComment.Id);
                Assert.True(responseWatchedComment.Watching);
            }
        }

        [Fact]
        public async Task AuthenticatedAsAdmin_ShouldGetIsApprovedProperty()
        {
            var question = _tag.Questions.First();
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_questionUserId, Role.Admin);

                var url = _generateUrl(question.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<AdminQuestionModel>(responseContent);
                Assert.True(responseModel.IsApproved);
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(0);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
