using System;
using System.Linq;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Services;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class CreateNotificationsForCommentDatabaseTests : IDisposable
    {
        private readonly User _watchingUser;
        private readonly User _postingUser;

        public CreateNotificationsForCommentDatabaseTests()
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
            var comment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, tag);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingQuestion_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var comment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, question);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingAnswer_ShouldGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var comment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, answer);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notifications = dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser);
                Assert.Contains(comment.Id, notifications.Select(x => x.Comment.Id));
            }
        }

        [Fact]
        public async Task WatchingAnswer_PostedBySelf_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            // Posted by watching user
            var comment = DataHelpers.CreateComments(answer, _watchingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, answer);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingAnswer_ChildComment_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var parentComment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();
            var childComment = DataHelpers.CreateChildComments(parentComment, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, answer);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(childComment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingDifferentAnswer_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 2).Single();
            var answers = question.Answers.ToArray();
            var answer = answers[0];
            var differentAnswer = answers[1];
            var comment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, differentAnswer);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingParentComment_ShouldGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var parentComment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();
            var comment = DataHelpers.CreateChildComments(parentComment, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, parentComment);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notifications = dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser);
                Assert.Contains(comment.Id, notifications.Select(x => x.Comment.Id));
            }
        }

        [Fact]
        public async Task WatchingParentComment_PostedBySelf_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var parentComment = DataHelpers.CreateComments(answer, _postingUser, 1).Single();
            // Posted by watching user
            var comment = DataHelpers.CreateChildComments(parentComment, _watchingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, parentComment);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                Assert.Empty(dbContext.Notifications.Where(x => x.OwnerUser == _watchingUser));
            }
        }

        [Fact]
        public async Task WatchingDifferentComment_ShouldNotGetNotification()
        {
            var question = DataHelpers.CreateQuestions(_postingUser, 1, _postingUser, 1).Single();
            var answer = question.Answers.Single();
            var parentComments = DataHelpers.CreateComments(answer, _postingUser, 2).ToArray();
            var parentComment = parentComments[0];
            var differentComment = parentComments[1];
            var comment = DataHelpers.CreateChildComments(parentComment, _postingUser, 1).Single();

            DataHelpers.CreateWatch(_watchingUser.Id, differentComment);

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var notificationsService = new NotificationsService(dbContext);
                await notificationsService.CreateNotificationsForComment(comment.Id);
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
