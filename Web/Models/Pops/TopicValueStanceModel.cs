using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Pops
{
    public class TopicValueStanceModel : TopicValueModel
    {
        public TopicValueStanceModel()
        {
        }
        public TopicValueStanceModel(PopTopic popTopic) : base(popTopic.Topic)
        {
            this.Stance = popTopic.Stance?.ToString();
        }

        public string Stance { get; set; }
    }
}