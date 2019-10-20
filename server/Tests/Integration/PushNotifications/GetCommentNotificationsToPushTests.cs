using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Domain.QueryObjects;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.PushNotifications
{
    public class GetCommentNotificationsToPushTests : IDisposable
    {
        private readonly User _user;

        public GetCommentNotificationsToPushTests()
        {
            _user = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task NothingToReturn_GetsEmptyArray()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        [Fact]
        public async Task NotificationExists_IsReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comment = DataHelpers.CreateComments(answer, _user, 1).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Single(commentNotifications);
                var commentNotification = commentNotifications.Single();
                Assert.Equal(notification.Id, commentNotification.NotificationId);
                Assert.Equal(pushToken, commentNotification.PushToken);
                Assert.Equal(question.Id, commentNotification.QuestionId);
                Assert.Equal(question.Text, commentNotification.QuestionText);
                Assert.Equal(answer.Id, commentNotification.AnswerId);
                Assert.Equal(answer.Text, commentNotification.AnswerText);
                Assert.Equal(comment.Id, commentNotification.CommentId);
                Assert.Equal(comment.Text, commentNotification.CommentText);
            }
        }

        [Fact]
        public async Task MultipleNotifications_AllReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comments = DataHelpers.CreateComments(answer, _user, 2).ToArray();
            var notification0 = DataHelpers.CreateNotifications(_user, comment: comments[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, comment: comments[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Equal(comments.Length, commentNotifications.Length);
                var ids = commentNotifications.Select(x => x.NotificationId).ToArray();
                Assert.Contains(notification0.Id, ids);
                Assert.Contains(notification1.Id, ids);
            }
        }

        [Fact]
        public async Task OldNotifications_OnlySinceIdIsReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comments = DataHelpers.CreateComments(answer, _user, 2).ToArray();
            var notification0 = DataHelpers.CreateNotifications(_user, comment: comments[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, comment: comments[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(notification0.Id);

                // Assert
                Assert.Single(commentNotifications);
                var commentNotification = commentNotifications.Single();
                Assert.Equal(notification1.Id, commentNotification.NotificationId);
            }
        }

        [Fact]
        public async Task NotificationAlreadySeen_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comment = DataHelpers.CreateComments(answer, _user, 1).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment, seen: true).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        [Fact]
        public async Task NoPushToken_NotReturned()
        {
            // Arrange
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comment = DataHelpers.CreateComments(answer, _user, 1).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        public async Task QuestionNotApproved_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1, questionStatus: Domain.PostStatus.AwaitingApproval).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comment = DataHelpers.CreateComments(answer, _user, 1).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        [Fact]
        public async Task CommentNotApproved_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            DataHelpers.CreateWatch(_user.Id, answer);
            var comment = DataHelpers.CreateComments(answer, _user, 1, commentStatus: Domain.PostStatus.AwaitingApproval).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        [Fact]
        public async Task NotWatchingAnswer_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            var comment = DataHelpers.CreateComments(answer, _user, 1).Single();
            var notification = DataHelpers.CreateNotifications(_user, comment: comment).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var commentNotifications = await new QueryExecutor(dbContext).GetCommentNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(commentNotifications);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}