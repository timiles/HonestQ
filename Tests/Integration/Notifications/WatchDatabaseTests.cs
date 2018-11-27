using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class WatchDatabaseTests : IDisposable
    {
        private readonly User _user;
        private readonly Question _question;
        private readonly Answer _answer;

        public WatchDatabaseTests()
        {
            _user = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            _answer = _question.Answers.First();
        }

        [Fact]
        public void ShouldNotSaveDuplicateTagWatches()
        {
            var tag = DataHelpers.CreateTag(_user, questions: _question);
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { TagId = tag.Id });
                dbContext.Watches.Add(new Watch(_user.Id) { TagId = tag.Id });
                Assert.Throws<DbUpdateException>(() => dbContext.SaveChanges());
            }
        }

        [Fact]
        public void ShouldNotSaveDuplicateQuestionWatches()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { QuestionId = _question.Id });
                dbContext.Watches.Add(new Watch(_user.Id) { QuestionId = _question.Id });
                Assert.Throws<DbUpdateException>(() => dbContext.SaveChanges());
            }
        }

        [Fact]
        public void ShouldNotSaveDuplicateAnswerWatches()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { AnswerId = _answer.Id });
                dbContext.Watches.Add(new Watch(_user.Id) { AnswerId = _answer.Id });
                Assert.Throws<DbUpdateException>(() => dbContext.SaveChanges());
            }
        }

        [Fact]
        public void ShouldNotSaveDuplicateCommentWatches()
        {
            var comment = DataHelpers.CreateComments(_answer, _user, 1).Single();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Watches.Add(new Watch(_user.Id) { CommentId = comment.Id });
                dbContext.Watches.Add(new Watch(_user.Id) { CommentId = comment.Id });
                Assert.Throws<DbUpdateException>(() => dbContext.SaveChanges());
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteWatches(_user.Id);
            DataHelpers.DeleteAllComments(_question.Id);
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
