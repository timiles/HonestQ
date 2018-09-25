using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Questions;

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
            this.Questions = topic.Questions.Select(x => new QuestionListItemModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string MoreInfoUrl { get; set; }
        public QuestionListItemModel[] Questions { get; set; }
    }
}