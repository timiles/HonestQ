using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class CommentModel
    {
        public CommentModel() { }
        public CommentModel(Comment comment, int? loggedInUserId, IDictionary<int, int> userPseudoIds = null)
        {
            this.Id = comment.Id;
            this.Text = comment.Text;
            this.Source = comment.Source;
            this.AgreementRating = comment.AgreementRating.ToString();
            this.PostedAt = comment.PostedAt.UtcDateTime;

            if (comment.IsAnonymous)
            {
                var postedByUserPseudoId = userPseudoIds?[comment.PostedByUserId] ?? 0;
                var isPostedByLoggedInUser = comment.PostedByUserId == loggedInUserId;
                this.PostedBy = $"Thread user #{postedByUserPseudoId}{(isPostedByLoggedInUser ? " (you)" : "")}";
            }
            else
            {
                this.PostedBy = comment.PostedByUser.Username;
            }

            this.Status = comment.Status.ToString();
            this.ParentCommentId = comment.ParentComment?.Id;
            this.Comments = comment.ChildComments.Where(x => x.Status == PostStatus.OK)
                .Select(x => new CommentModel(x, loggedInUserId, userPseudoIds)).ToArray();
            this.ReactionCounts = comment.Reactions.GroupBy(x => x.Type).ToDictionary(x => x.Key.ToString(), x => x.Count());
            if (loggedInUserId.HasValue)
            {
                this.MyReactions = comment.Reactions.Where(x => x.PostedByUserId == loggedInUserId).Select(x => x.Type.ToString()).ToArray();
            }

            this.WatchCount = comment.Watches.Count();
            this.IsWatchedByLoggedInUser = comment.Watches.Any(x => x.UserId == loggedInUserId);
        }

        public long Id { get; set; }
        [Required]
        public string Text { get; set; }
        public string Source { get; set; }
        [Required]
        public string AgreementRating { get; set; }
        public DateTime PostedAt { get; set; }
        [Required]
        public string PostedBy { get; set; }
        [Required]
        public string Status { get; set; }
        public long? ParentCommentId { get; set; }
        public CommentModel[] Comments { get; set; }
        public Dictionary<string, int> ReactionCounts { get; set; }
        public string[] MyReactions { get; set; }

        public int WatchCount { get; set; }
        public bool IsWatchedByLoggedInUser { get; set; }
    }
}