using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class StatementModel
    {
        public StatementModel() { }
        public StatementModel(Statement statement)
        {
            this.Slug = statement.Slug;
            this.Text = statement.Text;
            this.Source = statement.Source;
            this.Stance = statement.Stance?.ToString();
            this.Comments = statement.Comments.Select(x => new CommentListItemModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string Stance { get; set; }
        public CommentListItemModel[] Comments { get; set; }
    }
}