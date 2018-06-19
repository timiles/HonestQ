using System;
using System.Collections.Generic;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class CommentListItemModel
    {
        public CommentListItemModel() { }
        public CommentListItemModel(Comment comment)
        {
            this.Id = comment.Id;
            this.Text = comment.Text;
            this.AgreementRating = comment.AgreementRating.ToString();
            this.PostedAt = comment.PostedAt.UtcDateTime;
            this.PostedByUsername = comment.PostedByUser.Username;
        }

        public long Id { get; set; }
        public string Text { get; set; }
        public string AgreementRating { get; set; }
        public DateTime PostedAt { get; set; }
        public string PostedByUsername { get; set; }
    }
}