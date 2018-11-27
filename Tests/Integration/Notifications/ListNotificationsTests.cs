using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Notifications;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class ListNotificationsTests : IDisposable
    {
        private string _buildUrl(int? pageSize = null, long? beforeId = null) =>
            "/api/notifications?" +
            (pageSize.HasValue ? $"pageSize={pageSize}&" : "") +
            (beforeId.HasValue ? $"beforeId={beforeId}&" : "");

        private readonly int _notificationOwnerUserId;
        private readonly User _postingUser;
        private readonly Question _question;
        private readonly Answer _answer;
        private readonly Comment _comment;
        private readonly Comment _childComment;
        private readonly Tag _tag;
        private readonly IEnumerable<Notification> _notifications;

        public ListNotificationsTests()
        {
            var notificationOwnerUser = DataHelpers.CreateUser();
            _notificationOwnerUserId = notificationOwnerUser.Id;
            _postingUser = DataHelpers.CreateUser();

            _question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            _answer = _question.Answers.Single();
            _comment = DataHelpers.CreateComments(_answer, _postingUser, 1).Single();
            _childComment = DataHelpers.CreateChildComments(_comment, _postingUser, 1).Single();

            _tag = DataHelpers.CreateTag(_postingUser, questions: _question);
            _notifications = DataHelpers.CreateNotifications(notificationOwnerUser,
                _question, _answer, _comment, _childComment);
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_buildUrl());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldGetAllNotifications()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_buildUrl(1000));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsListModel>(responseContent);
                // Not really sure how better to test the LastId?
                Assert.True(responseModel.LastId > 0);

                // Check that all of the Questions in this Tag are in the most recent notifications
                Assert.NotNull(responseModel.Notifications.SingleOrDefault(x =>
                    x.Type == "Question" &&
                    x.QuestionId == _question.Id));

                Assert.NotNull(responseModel.Notifications.SingleOrDefault(x =>
                    x.Type == "Answer" &&
                    x.QuestionId == _question.Id &&
                    x.AnswerId == _answer.Id));

                Assert.NotNull(responseModel.Notifications.SingleOrDefault(x =>
                    x.Type == "Comment" &&
                    x.QuestionId == _question.Id &&
                    x.AnswerId == _answer.Id &&
                    x.CommentId == _comment.Id));

                Assert.NotNull(responseModel.Notifications.SingleOrDefault(x =>
                    x.Type == "Comment" &&
                    x.QuestionId == _question.Id &&
                    x.AnswerId == _answer.Id &&
                    x.CommentId == _childComment.Id));

                foreach (var responseNotification in responseModel.Notifications)
                {
                    switch (responseNotification.Type)
                    {
                        case "Question":
                            {
                                Assert.Equal(_question.Slug, responseNotification.QuestionSlug);
                                Assert.Equal(_question.Text, responseNotification.QuestionText);
                                AssertHelpers.Equal(_question.PostedAt, responseNotification.PostedAt, 10);
                                var tag = responseNotification.Tags.SingleOrDefault();
                                Assert.NotNull(tag);
                                Assert.Equal(_tag.Name, tag.Name);
                                Assert.Equal(_tag.Slug, tag.Slug);
                                break;
                            }
                        case "Answer":
                            {
                                Assert.Equal(_question.Slug, responseNotification.QuestionSlug);
                                Assert.Equal(_question.Text, responseNotification.QuestionText);
                                Assert.Equal(_answer.Slug, responseNotification.AnswerSlug);
                                Assert.Equal(_answer.Text, responseNotification.AnswerText);
                                AssertHelpers.Equal(_answer.PostedAt, responseNotification.PostedAt, 10);
                                break;
                            }
                        case "Comment":
                            {
                                Assert.Equal(_question.Slug, responseNotification.QuestionSlug);
                                Assert.Equal(_question.Text, responseNotification.QuestionText);
                                Assert.Equal(_answer.Slug, responseNotification.AnswerSlug);
                                Assert.Equal(_answer.Text, responseNotification.AnswerText);

                                // It's either _comment or _childComment
                                Comment c = (responseNotification.CommentText == _comment.Text) ? _comment : _childComment;
                                Assert.Equal(c.Text, responseNotification.CommentText);
                                AssertHelpers.Equal(c.PostedAt, responseNotification.PostedAt, 10);
                                Assert.Equal(c.AgreementRating.ToString(), responseNotification.AgreementRating);
                                break;
                            }
                        default:
                            {
                                Assert.True(false, $"Unexpected Type '{responseNotification.Type}'.");
                                break;
                            }
                    }
                }
            }
        }

        [Fact]
        public async Task PageSizeShouldBeOptional()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_buildUrl());
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsListModel>(responseContent);
                Assert.NotEmpty(responseModel.Notifications);
            }
        }

        [Fact]
        public async Task ShouldGetPageSize()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_buildUrl(3));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsListModel>(responseContent);
                Assert.Equal(3, responseModel.Notifications.Count());
            }
        }

        [Fact]
        public async Task ShouldGetAllNotificationsBeforeId()
        {
            var minId = _notifications.Min(x => x.Id); ;
            var maxId = _notifications.Max(x => x.Id); ;
            var beforeId = (minId + maxId) / 2;

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_buildUrl(1000, beforeId));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsListModel>(responseContent);

                var responseQuestions = responseModel.Notifications.Where(x => x.Type == "Question").ToArray();
                var responseAnswers = responseModel.Notifications.Where(x => x.Type == "Answer").ToArray();
                var responseComments = responseModel.Notifications.Where(x => x.Type == "Comment").ToArray();

                // Check that only Notification items before the cutoff id were returned
                foreach (var notification in _notifications)
                {
                    if (notification.Id < beforeId)
                    {
                        if (notification.Question != null)
                        {
                            Assert.Contains(notification.Question.Id, responseQuestions.Select(x => x.QuestionId));
                        }
                        if (notification.Answer != null)
                        {
                            Assert.Contains(notification.Answer.Id, responseAnswers.Select(x => x.AnswerId));
                        }
                        if (notification.Comment != null)
                        {
                            Assert.Contains(notification.Comment.Id, responseComments.Select(x => x.CommentId));
                        }
                    }
                    else
                    {
                        if (notification.Question != null)
                        {
                            Assert.DoesNotContain(notification.Question.Id, responseQuestions.Select(x => x.QuestionId));
                        }
                        if (notification.Answer != null)
                        {
                            Assert.DoesNotContain(notification.Answer.Id, responseAnswers.Select(x => x.AnswerId));
                        }
                        if (notification.Comment != null)
                        {
                            Assert.DoesNotContain(notification.Comment.Id, responseComments.Select(x => x.CommentId));
                        }
                    }
                }
            }
        }

        [Fact]
        public async Task ShouldHandleZeroItems()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_buildUrl(beforeId: 0));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsListModel>(responseContent);
                Assert.Empty(responseModel.Notifications);
                Assert.Equal(0, responseModel.LastId);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_notificationOwnerUserId);
            DataHelpers.DeleteUser(_postingUser.Id);
        }
    }
}
