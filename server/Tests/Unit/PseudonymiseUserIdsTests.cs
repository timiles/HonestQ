using System;
using Xunit;
using Pobs.Domain.Utils;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Questions;
using System.Linq;

namespace Pobs.Tests.Unit
{
    public class PseudonymiseUserIdsTests
    {
        private static Comment AddComment(Answer answer, int postedByUserId, int postedHoursOffset,
            Comment parentComment = null, string postedByUsername = null)
        {
            var comment = new Comment();
            comment.PostedAt = DateTime.UtcNow.AddHours(postedHoursOffset);
            comment.PostedByUserId = postedByUserId;
            if (postedByUsername != null)
            {
                comment.PostedByUser = new User { Username = postedByUsername };
            }
            else
            {
                comment.IsAnonymous = true;
            }

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
            answer.PostedByUser = new User { Id = 1, Username = "poi" };

            var comment1 = AddComment(answer, 234, -30);
            AddComment(answer, 1, -20, comment1);
            AddComment(answer, 1, -25);
            AddComment(answer, 1, -24, postedByUsername: "Bobby");

            var comment3 = AddComment(answer, 123, -15);
            AddComment(answer, 1, -14, comment3);
            AddComment(answer, 234, -13, comment3);

            // Pseudo Ids should be 0 for the original poster of the Answer, then incrementing in order of time of first Comment
            var answerModel = new AnswerModel(answer, null);
            var commentsOrderedByPostedAt = answerModel.Comments.OrderBy(x => x.PostedAt).ToArray();
            Assert.Equal("Thread user #1", commentsOrderedByPostedAt[0].PostedBy);
            Assert.Equal("Thread user #0", commentsOrderedByPostedAt[0].Comments[0].PostedBy);
            Assert.Equal("Thread user #0", commentsOrderedByPostedAt[1].PostedBy);
            Assert.Equal("Bobby", commentsOrderedByPostedAt[2].PostedBy);
            Assert.Equal("Thread user #2", commentsOrderedByPostedAt[3].PostedBy);

            var childCommentsOrderedByPostedAt = commentsOrderedByPostedAt[3].Comments.OrderBy(x => x.PostedAt).ToArray();
            Assert.Equal("Thread user #0", childCommentsOrderedByPostedAt[0].PostedBy);
            Assert.Equal("Thread user #1", childCommentsOrderedByPostedAt[1].PostedBy);
        }
    }
}
