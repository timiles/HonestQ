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

        private ReactionModel(IEnumerable<Reaction> reactions, ReactionType reactionType, int loggedInUserId) : this()
        {
            this.Type = reactionType.ToString();

            var reactionOfThisType = reactions.Where(x => x.Type == reactionType);
            this.NewCount = reactionOfThisType.Count();
            this.IsMyReaction = reactionOfThisType.Any(x => x.PostedByUserId == loggedInUserId);
        }

        public ReactionModel(int questionId, Answer answer, ReactionType reactionType, int loggedInUserId)
            : this(answer.Reactions, reactionType, loggedInUserId)
        {
            this.QuestionId = questionId;
            this.AnswerId = answer.Id;
        }

        public ReactionModel(int questionId, int answerId, Comment comment, ReactionType reactionType, int loggedInUserId)
            : this(comment.Reactions, reactionType, loggedInUserId)
        {
            this.QuestionId = questionId;
            this.AnswerId = answerId;
            this.CommentId = comment.Id;
        }

        public int QuestionId { get; set; }
        public int AnswerId { get; set; }
        public long? CommentId { get; set; }
        [Required]
        public string Type { get; set; }
        public int NewCount { get; set; }
        public bool IsMyReaction { get; set; }
    }
}