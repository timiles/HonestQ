using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Domain.QueryObjects;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.PushNotifications
{
    public class GetAnswerNotificationsToPushTests : IDisposable
    {
        private readonly User _user;

        public GetAnswerNotificationsToPushTests()
        {
            _user = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task NothingToReturn_GetsEmptyArray()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(answerNotifications);
            }
        }

        [Fact]
        public async Task NotificationExists_IsReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answer = question.Answers.Single();
            var notification = DataHelpers.CreateNotifications(_user, answer: answer).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Single(answerNotifications);
                var answerNotification = answerNotifications.Single();
                Assert.Equal(notification.Id, answerNotification.NotificationId);
                Assert.Equal(pushToken, answerNotification.PushToken);
                Assert.Equal(question.Id, answerNotification.QuestionId);
                Assert.Equal(question.Text, answerNotification.QuestionText);
                Assert.Equal(answer.Id, answerNotification.AnswerId);
                Assert.Equal(answer.Text, answerNotification.AnswerText);
            }
        }

        [Fact]
        public async Task MultipleNotifications_AllReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 2).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answers = question.Answers.ToArray();
            var notification0 = DataHelpers.CreateNotifications(_user, answer: answers[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, answer: answers[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Equal(answers.Length, answerNotifications.Length);
                var ids = answerNotifications.Select(x => x.NotificationId).ToArray();
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
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 2).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answers = question.Answers.ToArray();
            var notification0 = DataHelpers.CreateNotifications(_user, answer: answers[0]).Single();
            var notification1 = DataHelpers.CreateNotifications(_user, answer: answers[1]).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(notification0.Id);

                // Assert
                Assert.Single(answerNotifications);
                var answerNotification = answerNotifications.Single();
                Assert.Equal(notification1.Id, answerNotification.NotificationId);
            }
        }

        [Fact]
        public async Task NotificationAlreadySeen_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answer = question.Answers.Single();
            var notification = DataHelpers.CreateNotifications(_user, answer: answer, seen: true).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(answerNotifications);
            }
        }

        [Fact]
        public async Task NoPushToken_NotReturned()
        {
            // Arrange
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answer = question.Answers.Single();
            var notification = DataHelpers.CreateNotifications(_user, answer: answer).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(answerNotifications);
            }
        }

        public async Task QuestionNotApproved_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1, questionStatus: Domain.PostStatus.AwaitingApproval).Single();
            DataHelpers.CreateWatch(_user.Id, question);
            var answer = question.Answers.Single();
            var notification = DataHelpers.CreateNotifications(_user, answer: answer).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(answerNotifications);
            }
        }

        [Fact]
        public async Task NotWatchingQuestion_NotReturned()
        {
            // Arrange
            var pushToken = "waffle_" + Guid.NewGuid();
            DataHelpers.CreatePushToken(pushToken, _user.Id);
            var question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            var answer = question.Answers.Single();
            var notification = DataHelpers.CreateNotifications(_user, answer: answer).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                // Act
                var answerNotifications = await new QueryExecutor(dbContext).GetAnswerNotificationsToPushAsync(0);

                // Assert
                Assert.Empty(answerNotifications);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}