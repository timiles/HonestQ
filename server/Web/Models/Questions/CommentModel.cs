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
            this.IsAgree = comment.AgreementRating == AgreementRating.Agree;
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
            this.IsAnonymous = comment.IsAnonymous;

            this.Status = comment.Status.ToString();
            this.ParentCommentId = comment.ParentComment?.Id;
            this.Comments = comment.ChildComments.Where(x => x.Status == PostStatus.OK)
                .Select(x => new CommentModel(x, loggedInUserId, userPseudoIds))
                .OrderByDescending(x => x.Upvotes).ThenByDescending(x => x.PostedAt)
                .ToArray();
            this.Upvotes = comment.Reactions.Count(x => x.Type == ReactionType.Upvote);
            if (loggedInUserId.HasValue)
            {
                this.UpvotedByMe = comment.Reactions.Any(x => x.PostedByUserId == loggedInUserId && x.Type == ReactionType.Upvote);
            }
        }

        public long Id { get; set; }
        [Required]
        public string Text { get; set; }
        public string Source { get; set; }
        public bool IsAgree { get; set; }
        public DateTime PostedAt { get; set; }
        [Required]
        public string PostedBy { get; set; }
        public bool IsAnonymous { get; set; }
        [Required]
        public string Status { get; set; }
        public long? ParentCommentId { get; set; }
        public CommentModel[] Comments { get; set; }
        public int Upvotes { get; set; }
        public bool UpvotedByMe { get; set; }
    }
}