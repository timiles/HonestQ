using System;
using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Pops
{
    public class CommentModel
    {
        public CommentModel() { }
        public CommentModel(Comment comment, IDictionary<int, int> userPseudoIds = null)
        {
            this.Id = comment.Id;
            this.Text = comment.Text;
            this.Source = comment.Source;
            this.AgreementRating = comment.AgreementRating.ToString();
            this.PostedAt = comment.PostedAt.UtcDateTime;
            this.PostedByUserPseudoId = userPseudoIds?[comment.PostedByUserId] ?? 0;
            this.Comments = comment.ChildComments.Select(x => new CommentModel(x, userPseudoIds)).ToArray();
        }

        public long Id { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string AgreementRating { get; set; }
        public DateTime PostedAt { get; set; }
        public int PostedByUserPseudoId { get; set; }
        public long? ParentCommentId { get; set; }
        public CommentModel[] Comments { get; set; }
    }
}