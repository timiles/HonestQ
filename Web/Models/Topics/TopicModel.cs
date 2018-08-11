using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Pops;

namespace Pobs.Web.Models.Topics
{
    public class TopicModel
    {
        public TopicModel() { }
        public TopicModel(Topic topic)
        {
            this.Slug = topic.Slug;
            this.Name = topic.Name;
            this.Summary = topic.Summary;
            this.MoreInfoUrl = topic.MoreInfoUrl;
            this.Pops = topic.Pops.Select(x => new PopListItemModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string MoreInfoUrl { get; set; }
        public PopListItemModel[] Pops { get; set; }
    }
}