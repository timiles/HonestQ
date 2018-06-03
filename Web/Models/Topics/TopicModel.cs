using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class TopicModel
    {
        public TopicModel() { }
        public TopicModel(Topic topic)
        {
            this.Slug = topic.Slug;
            this.Name = topic.Name;
            this.Statements = topic.Statements.Select(x => new StatementListItemModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Name { get; set; }
        public StatementListItemModel[] Statements { get; set; }
    }
}