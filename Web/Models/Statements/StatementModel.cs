using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Statements
{
    public class StatementModel
    {
        public StatementModel() { }
        public StatementModel(Statement statement, IEnumerable<Comment> topLevelComments)
        {
            this.Slug = statement.Slug;
            this.Text = statement.Text;
            this.Source = statement.Source;
            this.Type = statement.Type.ToString();
            this.Topics = statement.Topics.Select(x => new TopicValueModel(x)).ToArray();
            this.Comments = topLevelComments.Select(x => new CommentModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string Type { get; set; }
        public TopicValueModel[] Topics { get; set; }
        public CommentModel[] Comments { get; set; }
    }
}