using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class StatementModel
    {
        public StatementModel() { }
        public StatementModel(Statement statement)
        {
            this.Text = statement.Text;
            this.Comments = statement.Comments.Select(x => new CommentListItemModel(x)).ToArray();
        }

        public string Text { get; set; }
        public CommentListItemModel[] Comments { get; set; }
    }
}