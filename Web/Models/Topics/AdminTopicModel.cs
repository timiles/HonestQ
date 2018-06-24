using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class AdminTopicModel : TopicModel
    {
        public AdminTopicModel() : base() { }
        public AdminTopicModel(Topic topic) : base(topic)
        {
            this.IsApproved = topic.IsApproved;
        }

        public bool IsApproved { get; set; }
    }
}