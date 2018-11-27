using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Services;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class CreateNotificationsForQuestionDatabaseTests : IDisposable
    {
        private readonly User _watchingUser;
        private readonly User _postingUser;

        public CreateNotificationsForQuestionDatabaseTests()
        {
            _watchingUser = DataHelpers.CreateUser();
            _postingUser = DataHelpers.CreateUser();
        }

        [Fact]
        public async Task WatchingTag_ShouldGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1).Single();
            var tag = DataHelpers.CreateTag(_postingUser, questions: question);

            DataHelpers.CreateWatch(_watchingUser.Id, tag);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotifications(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notifications = dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser);
                Assert.Contains(question.Id, notifications.Select(x => x.Question.Id));
            }
        }

        [Fact]
        public async Task WatchingTag_PostedBySelf_ShouldNotGetNotification()
        {
            // Posted by watching user
            var question = DataHelpers.CreateQuestions(_watchingUser, 1).Single();
            var tag = DataHelpers.CreateTag(_postingUser, questions: question);

            DataHelpers.CreateWatch(_watchingUser.Id, tag);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotifications(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingDifferentTag_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1).Single();
            var tag = DataHelpers.CreateTag(_postingUser, questions: question);
            var differentTag = DataHelpers.CreateTag(_postingUser);

            DataHelpers.CreateWatch(_watchingUser.Id, differentTag);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotifications(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingTwoTagsLinkedToQuestion_ShouldGetNotificationOnlyOnce()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1).Single();
            var tag1 = DataHelpers.CreateTag(_postingUser, questions: question);
            var tag2 = DataHelpers.CreateTag(_postingUser, questions: question);

            DataHelpers.CreateWatch(_watchingUser.Id, tag1);
            DataHelpers.CreateWatch(_watchingUser.Id, tag2);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotifications(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Single(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_watchingUser.Id);
            DataHelpers.DeleteUser(_postingUser.Id);
        }
    }
}
