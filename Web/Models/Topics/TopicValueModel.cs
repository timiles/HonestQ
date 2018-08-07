using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class TopicValueModel
    {
        public TopicValueModel()
        {
        }
        public TopicValueModel(Topic topic)
        {
            this.Name = topic.Name;
            this.Slug = topic.Slug;
        }
        public string Name { get; set; }
        public string Slug { get; set; }
    }
}