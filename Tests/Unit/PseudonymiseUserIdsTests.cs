using System;
using Xunit;
using Pobs.Domain.Utils;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Questions;

namespace Pobs.Tests.Unit
{
    public class PseudonymiseUserIdsTests
    {
        private static Comment AddComment(Answer answer, int postedByUserId, int postedHoursOffset, Comment parentComment = null)
        {
            var comment = new Comment();
            comment.PostedAt = DateTime.UtcNow.AddHours(postedHoursOffset);
            comment.PostedByUserId = postedByUserId;

            answer.Comments.Add(comment);
            if (parentComment != null)
            {
                parentComment.ChildComments.Add(comment);
                comment.ParentComment = parentComment;
            }

            return comment;
        }

        [Fact]
        public void GivenAnswerWithComments_PseudonymisesUserIds()
        {
            var answer = new Answer();
            answer.PostedAt = DateTime.UtcNow.AddHours(-40);
            answer.PostedByUserId = 1;

            var comment1 = AddComment(answer, 234, -30);
            AddComment(answer, 1, -20, comment1);
            AddComment(answer, 1, -25);

            var comment3 = AddComment(answer, 123, -15);
            AddComment(answer, 1, -14, comment3);
            AddComment(answer, 234, -13, comment3);

            // Pseudo Ids should be 0 for the original poster of the Answer, then incrementing in order of time of first Comment
            var answerModel = new AnswerModel(answer);
            Assert.Equal(1, answerModel.Comments[0].PostedByUserPseudoId);
            Assert.Equal(0, answerModel.Comments[0].Comments[0].PostedByUserPseudoId);
            Assert.Equal(0, answerModel.Comments[1].PostedByUserPseudoId);
            Assert.Equal(2, answerModel.Comments[2].PostedByUserPseudoId);
            Assert.Equal(0, answerModel.Comments[2].Comments[0].PostedByUserPseudoId);
            Assert.Equal(1, answerModel.Comments[2].Comments[1].PostedByUserPseudoId);
        }
    }
}
