using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class ReactionsDatabaseTests : IDisposable
    {
        private readonly User _user;
        private readonly Question _question;
        private readonly Comment _comment;

        public ReactionsDatabaseTests()
        {
            _user = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_user, 1, _user, 1).Single();
            DataHelpers.CreateComments(_question.Answers.First(), _user, 1);
            _comment = _question.Answers.First().Comments.First();
        }

        [Fact]
        public void ShouldNotSaveDuplicateReactions()
        {
            var reactionType = ReactionType.ThisMadeMeThink;
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(_comment);
                _comment.Reactions.Add(new Reaction(reactionType, _user.Id, DateTimeOffset.UtcNow));
                _comment.Reactions.Add(new Reaction(reactionType, _user.Id, DateTimeOffset.UtcNow));
                Assert.Throws<DbUpdateException>(() => dbContext.SaveChanges());
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteAllComments(_question.Id);
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
