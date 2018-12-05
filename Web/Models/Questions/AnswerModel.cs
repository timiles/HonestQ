using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class AnswerModel
    {
        private static IDictionary<int, int> PseudonymiseUserIds(Answer answer)
        {
            var pseudoIds = new Dictionary<int, int>();
            int pseudoId = 0;

            // Original poster of the Answer is always pseudoId 0
            pseudoIds.Add(answer.PostedByUserId, pseudoId++);

            foreach (var comment in answer.Comments.OrderBy(x => x.PostedAt))
            {
                if (!pseudoIds.ContainsKey(comment.PostedByUserId))
                {
                    pseudoIds.Add(comment.PostedByUserId, pseudoId++);
                }
            }

            return pseudoIds;
        }

        public AnswerModel() { }
        public AnswerModel(Answer answer, int? loggedInUserId)
        {
            this.Id = answer.Id;
            this.Text = answer.Text;
            this.Slug = answer.Slug;
            this.Source = answer.Source;
            this.PostedAt = answer.PostedAt.UtcDateTime;

            this.PostedBy = answer.PostedByUser.Username;

            var userPseudoIds = PseudonymiseUserIds(answer);
            this.PostedByUserPseudoId = userPseudoIds?[answer.PostedByUserId] ?? 0;
            var topLevelComments = answer.Comments.Where(x => x.Status == PostStatus.OK && x.ParentComment == null);
            this.Comments = topLevelComments.Select(x => new CommentModel(x, loggedInUserId, userPseudoIds)).ToArray();

            this.ReactionCounts = answer.Reactions.GroupBy(x => x.Type).ToDictionary(x => x.Key.ToString(), x => x.Count());
            if (loggedInUserId.HasValue)
            {
                this.MyReactions = answer.Reactions.Where(x => x.PostedByUserId == loggedInUserId).Select(x => x.Type.ToString()).ToArray();
            }

            this.IsWatchedByLoggedInUser = answer.Watches.Any(x => x.UserId == loggedInUserId);
        }

        public int Id { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        public string Slug { get; set; }

        public string Source { get; set; }

        public DateTime PostedAt { get; set; }

        [Required]
        public string PostedBy { get; set; }
        public int PostedByUserPseudoId { get; set; }

        public CommentModel[] Comments { get; set; }
        public Dictionary<string, int> ReactionCounts { get; set; }
        public string[] MyReactions { get; set; }

        public bool IsWatchedByLoggedInUser { get; set; }
    }
}