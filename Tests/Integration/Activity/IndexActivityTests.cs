using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Activity;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Activity
{
    public class IndexActivityTests : IDisposable
    {
        private readonly string _url = "/api/activity";
        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly Topic _topic;

        public IndexActivityTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create multiple Questions, Answers and Comments
            _topic = DataHelpers.CreateTopic(questionUser, 2, answerUser, 3, isApproved: true);
            DataHelpers.CreateComments(_topic.Questions.First().Answers.First(), answerUser, 4);
        }

        [Fact]
        public async Task ShouldGetAllActivity()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_questionUserId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<ActivityListModel>(responseContent);

                // Check that all of this Topic is in the most recent activity
                foreach (var question in _topic.Questions)
                {
                    Assert.NotNull(responseModel.Activities.SingleOrDefault(x =>
                        x.Type == "Question" &&
                        x.QuestionId == question.Id));

                    foreach (var answer in question.Answers)
                    {
                        Assert.NotNull(responseModel.Activities.SingleOrDefault(x =>
                            x.Type == "Answer" &&
                            x.QuestionId == question.Id &&
                            x.AnswerId == answer.Id));

                        foreach (var comment in answer.Comments)
                        {
                            Assert.NotNull(responseModel.Activities.SingleOrDefault(x =>
                                x.Type == "Comment" &&
                                x.QuestionId == question.Id &&
                                x.AnswerId == answer.Id &&
                                x.CommentId == comment.Id));
                        }
                    }
                }

                foreach (var responseActivity in responseModel.Activities)
                {
                    switch (responseActivity.Type)
                    {
                        case "Question":
                            {
                                // In case this particular response comes from a different Topic, eg a concurrent test
                                var question = _topic.Questions.FirstOrDefault(x => x.Id == responseActivity.QuestionId);
                                if (question != null)
                                {
                                    Assert.Equal(question.Slug, responseActivity.QuestionSlug);
                                    Assert.Equal(question.Text, responseActivity.QuestionText);
                                    AssertHelpers.Equal(question.PostedAt, responseActivity.PostedAt, 10);
                                    Assert.Equal(question.Answers.Count(), responseActivity.ChildCount);
                                }
                                break;
                            }
                        case "Answer":
                            {
                                var question = _topic.Questions.FirstOrDefault(x => x.Id == responseActivity.QuestionId);
                                if (question != null)
                                {
                                    var answer = question.Answers.Single(x => x.Id == responseActivity.AnswerId);
                                    Assert.Equal(question.Slug, responseActivity.QuestionSlug);
                                    Assert.Equal(question.Text, responseActivity.QuestionText);
                                    Assert.Equal(answer.Slug, responseActivity.AnswerSlug);
                                    Assert.Equal(answer.Text, responseActivity.AnswerText);
                                    AssertHelpers.Equal(answer.PostedAt, responseActivity.PostedAt, 10);
                                    Assert.Equal(answer.Comments.Count(), responseActivity.ChildCount);
                                }
                                break;
                            }
                        case "Comment":
                            {
                                var question = _topic.Questions.FirstOrDefault(x => x.Id == responseActivity.QuestionId);
                                if (question != null)
                                {
                                    var answer = question.Answers.Single(x => x.Id == responseActivity.AnswerId);
                                    var comment = answer.Comments.Single(x => x.Id == responseActivity.CommentId);
                                    Assert.Equal(question.Slug, responseActivity.QuestionSlug);
                                    Assert.Equal(question.Text, responseActivity.QuestionText);
                                    Assert.Equal(answer.Slug, responseActivity.AnswerSlug);
                                    Assert.Equal(answer.Text, responseActivity.AnswerText);
                                    Assert.Equal(comment.Text, responseActivity.CommentText);
                                    AssertHelpers.Equal(comment.PostedAt, responseActivity.PostedAt, 10);
                                    Assert.Equal(comment.AgreementRating.ToString(), responseActivity.AgreementRating);
                                }
                                break;
                            }
                        default:
                            {
                                Assert.True(false, $"Unexpected Type '{responseActivity.Type}'.");
                                break;
                            }
                    }
                }
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
