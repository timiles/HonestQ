using System;

namespace Pobs.Web.Models.Topics
{
    public class CommentListItemModel
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public DateTime PostedAt { get; set; }
        public string PostedByUsername { get; set; }
    }
}