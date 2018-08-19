using System;
using Xunit;
using Pobs.Domain.Utils;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Pops;

namespace Pobs.Tests.Unit
{
    public class PseudonymiseUserIdsTests
    {
        private static Comment AddComment(Pop pop, int postedByUserId, int postedHoursOffset, Comment parentComment = null)
        {
            var comment = new Comment();
            comment.PostedAt = DateTime.UtcNow.AddHours(postedHoursOffset);
            comment.PostedByUserId = postedByUserId;

            pop.Comments.Add(comment);
            if (parentComment != null)
            {
                parentComment.ChildComments.Add(comment);
                comment.ParentComment = parentComment;
            }

            return comment;
        }

        [Fact]
        public void GivenPopWithComments_PseudonymisesUserIds()
        {
            var pop = new Pop();
            pop.PostedAt = DateTime.UtcNow.AddHours(-40);
            pop.PostedByUserId = 1;

            var comment1 = AddComment(pop, 234, -30);
            AddComment(pop, 1, -20, comment1);
            AddComment(pop, 1, -25);

            var comment3 = AddComment(pop, 123, -15);
            AddComment(pop, 1, -14, comment3);
            AddComment(pop, 234, -13, comment3);

            // Pseudo Ids should be 0 for the original poster of the Pop, then incrementing in order of time of first Comment
            var popModel = new PopModel(pop);
            Assert.Equal(1, popModel.Comments[0].PostedByUserPseudoId);
            Assert.Equal(0, popModel.Comments[0].Comments[0].PostedByUserPseudoId);
            Assert.Equal(0, popModel.Comments[1].PostedByUserPseudoId);
            Assert.Equal(2, popModel.Comments[2].PostedByUserPseudoId);
            Assert.Equal(0, popModel.Comments[2].Comments[0].PostedByUserPseudoId);
            Assert.Equal(1, popModel.Comments[2].Comments[1].PostedByUserPseudoId);
        }
    }
}
