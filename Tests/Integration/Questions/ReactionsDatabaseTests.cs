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
        private readonly Topic _topic;
        private readonly Comment _comment;

        public ReactionsDatabaseTests()
        {
            _user = DataHelpers.CreateUser();
            _topic = DataHelpers.CreateTopic(_user, 1, _user, 1);
            DataHelpers.CreateComments(_topic.Questions.First().Answers.First(), _user, 1);
            _comment = _topic.Questions.First().Answers.First().Comments.First();
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
            DataHelpers.DeleteAllComments(_topic.Id);
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
