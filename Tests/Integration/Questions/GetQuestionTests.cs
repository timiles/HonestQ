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
        private readonly Tag _unapprovedTag;

        public GetQuestionTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create 3 questions so we can be sure we get the one we request
            var questions = DataHelpers.CreateQuestions(questionUser, 3, answerUser, 3);
            _tag = DataHelpers.CreateTag(questionUser, isApproved: true, questions: questions.ToArray());
            _unapprovedTag = DataHelpers.CreateTag(questionUser, isApproved: false, questions: questions.ToArray());
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
                Assert.Equal(question.Context, responseModel.Context);
                Assert.Equal(question.PostedByUser.Username, responseModel.PostedBy);

                Assert.DoesNotContain(_unapprovedTag.Slug, responseModel.Tags.Select(x => x.Slug));

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

            // Add an Upvote to an Answer
            var answerWithUpvote = question.Answers.First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(answerWithUpvote);
                answerWithUpvote.Reactions.Add(new Reaction(ReactionType.Upvote, _questionUserId, DateTimeOffset.UtcNow));
                dbContext.SaveChanges();
            }

            // Add an Upvote to a Comment
            var commentWithUpvote = question.Answers.First().Comments.First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(commentWithUpvote);
                commentWithUpvote.Reactions.Add(new Reaction(ReactionType.Upvote, _questionUserId, DateTimeOffset.UtcNow));
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
                Assert.Equal(question.Context, responseModel.Context);
                Assert.Equal(question.PostedByUser.Username, responseModel.PostedBy);

                Assert.Single(responseModel.Tags);
                Assert.Equal(3, question.Answers.Count);

                var responseAnswerWithUpvote = responseModel.Answers.Single(x => x.Id == answerWithUpvote.Id);
                Assert.Equal(1, responseAnswerWithUpvote.Upvotes);
                Assert.True(responseAnswerWithUpvote.UpvotedByMe);

                var responseCommentWithUpvote = responseModel.Answers.SelectMany(x => x.Comments).Single(x => x.Id == commentWithUpvote.Id);
                Assert.Equal(1, responseCommentWithUpvote.Upvotes);
                Assert.True(responseCommentWithUpvote.UpvotedByMe);
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
