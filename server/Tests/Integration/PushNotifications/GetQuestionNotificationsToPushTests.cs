using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Domain.QueryObjects;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.PushNotifications
{
    public class GetQuestionNotificationsToPushTests : IDisposable
    {
        private readonly User _user;

        public GetQuestionNotificationsToPushTests()
        {
            _user = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task NothingToReturn_GetsEmptyArray()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(questionNotifications);
            }
        }

        [Fact]
        public async Task NotificationExists_IsReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1).Single();
            var tag = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification = DataHelpers.CreateNotifications(_user, question).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Single(questionNotifications);
                var questionNotification = questionNotifications.Single();
                Assert.Equal(notification.Id, questionNotification.NotificationId);
                Assert.Equal(pushToken, questionNotification.PushToken);
                Assert.Equal(question.Id, questionNotification.QuestionId);
                Assert.Equal(question.Text, questionNotification.QuestionText);
                Assert.Equal(tag.Name, questionNotification.TagNames);
            }
        }

        [Fact]
        public async Task MultipleTags_OnlyReturnsWatchingTags()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1).Single();

            var watchingTag1 = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, watchingTag1);
            var watchingTag2 = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, watchingTag2);
            var notWatchingTag = DataHelpers.CreateTag(_user, questions: question);

            var notification = DataHelpers.CreateNotifications(_user, question).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Single(questionNotifications);
                var questionNotification = questionNotifications.Single();
                Assert.Equal(notification.Id, questionNotification.NotificationId);

                var expectedTags = string.Join('|', new[] { watchingTag1.Name, watchingTag2.Name }.OrderBy(x => x));
                Assert.Equal(expectedTags, questionNotification.TagNames);
            }
        }

        [Fact]
        public async Task MultipleNotifications_AllReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var questions = DataHelpers.CreateQuestions(_user, 2).ToArray();
            var tag = DataHelpers.CreateTag(_user, questions: questions);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification0 = DataHelpers.CreateNotifications(_user, questions[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, questions[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Equal(questions.Length, questionNotifications.Length);
                var ids = questionNotifications.Select(x => x.NotificationId).ToArray();
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
            var questions = DataHelpers.CreateQuestions(_user, 2).ToArray();
            var tag = DataHelpers.CreateTag(_user, questions: questions);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification0 = DataHelpers.CreateNotifications(_user, questions[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, questions[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(notification0.Id);

                // Assert
                Assert.Single(questionNotifications);
                var questionNotification = questionNotifications.Single();
                Assert.Equal(notification1.Id, questionNotification.NotificationId);
            }
        }

        [Fact]
        public async Task NotificationAlreadySeen_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1).Single();
            var tag = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification = DataHelpers.CreateNotifications(_user, question, seen: true).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(questionNotifications);
            }
        }

        [Fact]
        public async Task NoPushToken_NotReturned()
        {
            // Arrange
            var question = DataHelpers.CreateQuestions(_user, 1).Single();
            var tag = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification = DataHelpers.CreateNotifications(_user, question).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(questionNotifications);
            }
        }

        [Fact]
        public async Task QuestionNotApproved_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, questionStatus: Domain.PostStatus.AwaitingApproval).Single();
            var tag = DataHelpers.CreateTag(_user, questions: question);
            DataHelpers.CreateWatch(_user.Id, tag);
            var notification = DataHelpers.CreateNotifications(_user, question).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(questionNotifications);
            }
        }

        [Fact]
        public async Task NotWatchingTag_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1).Single();
            var tag = DataHelpers.CreateTag(_user, questions: question);
            var notification = DataHelpers.CreateNotifications(_user, question).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var questionNotifications = await new QueryExecutor(dbContext).GetQuestionNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(questionNotifications);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}