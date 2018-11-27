using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Services;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class CreateNotificationsForAnswerDatabaseTests : IDisposable
    {
        private readonly User _watchingUser;
        private readonly User _postingUser;

        public CreateNotificationsForAnswerDatabaseTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task WatchingTag_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var tag = DataHelpers.CreateTag(_postingUser, questions: question);
            var answer = question.Answers.Single();

            DataHelpers.CreateWatch(_watchingUser.Id, tag);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForAnswer(answer.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingQuestion_ShouldGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();

            DataHelpers.CreateWatch(_watchingUser.Id, question);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForAnswer(answer.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notifications = dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser);
                Assert.Contains(answer.Id, notifications.Select(x => x.Answer.Id));
            }
        }

        [Fact]
        public async Task WatchingQuestion_PostedBySelf_ShouldNotGetNotification()
        {
            // Posted by watching user
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _watchingUser, 1).Single();
            var answer = question.Answers.Single();

            DataHelpers.CreateWatch(_watchingUser.Id, question);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForAnswer(answer.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingDifferentQuestion_ShouldNotGetNotification()
        {
            var questions = DataHelpers.CreateQuestions(_postingUser, 2, _postingUser, 1).ToArray();
            var question = questions[0];
            var differentQuestion = questions[1];
            var answer = question.Answers.Single();

            DataHelpers.CreateWatch(_watchingUser.Id, differentQuestion);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForAnswer(answer.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_watchingUser.Id);
            DataHelpers.DeleteUser(_postingUser.Id);
        }
    }
}
