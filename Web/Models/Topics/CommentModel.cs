using System;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class CommentModel
    {
        public CommentModel() { }
        public CommentModel(Comment comment)
        {
            this.Id = comment.Id;
            this.Text = comment.Text;
            this.Source = comment.Source;
            this.AgreementRating = comment.AgreementRating.ToString();
            this.PostedAt = comment.PostedAt.UtcDateTime;
            this.PostedByUsername = comment.PostedByUser.Username;
            this.Comments = comment.ChildComments.Select(x => new CommentModel(x)).ToArray();
        }

        public long Id { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string AgreementRating { get; set; }
        public DateTime PostedAt { get; set; }
        public string PostedByUsername { get; set; }
        public long? ParentCommentId { get; set; }
        public CommentModel[] Comments { get; set; }
    }
}