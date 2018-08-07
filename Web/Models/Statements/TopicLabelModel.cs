using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Statements
{
    public class TopicLabelModel
    {
        public TopicLabelModel()
        {
        }
        public TopicLabelModel(Topic topic)
        {
            this.Name = topic.Name;
            this.Slug = topic.Slug;
        }
        public string Name { get; set; }
        public string Slug { get; set; }
    }
}