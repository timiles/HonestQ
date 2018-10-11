using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class ReactionModel
    {
        public ReactionModel() { }
        public ReactionModel(int questionId, int answerId, Comment comment, ReactionType reactionType, int loggedInUserId)
        {
            this.QuestionId = questionId;
            this.AnswerId = answerId;
            this.CommentId = comment.Id;
            this.Type = reactionType.ToString();

            var reactionOfThisType = comment.Reactions.Where(x => x.Type == reactionType);
            this.NewCount = reactionOfThisType.Count();
            this.IsMyReaction = reactionOfThisType.Any(x => x.PostedByUserId == loggedInUserId);
        }

        public int QuestionId { get; set; }
        public int AnswerId { get; set; }
        public long CommentId { get; set; }
        [Required]
        public string Type { get; set; }
        public int NewCount { get; set; }
        public bool IsMyReaction { get; set; }
    }
}