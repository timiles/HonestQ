using System;
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
            this.PostedAt = comment.PostedAt;
            this.PostedByUsername = comment.PostedByUser.Username;
        }

        public long Id { get; set; }
        public string Text { get; set; }
        public DateTime PostedAt { get; set; }
        public string PostedByUsername { get; set; }
    }
}