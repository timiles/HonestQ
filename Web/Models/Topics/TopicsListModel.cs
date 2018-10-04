using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class TopicsListModel
    {
        public TopicsListModel() { }
        public TopicsListModel(List<Topic> topics)
        {
            this.Topics = topics.Select(x => new TopicsListModel.TopicListItemModel(x)).ToArray();
        }

        public TopicListItemModel[] Topics { get; set; }

        public class TopicListItemModel
        {
            public TopicListItemModel() { }
            public TopicListItemModel(Topic topic)
            {
                this.Slug = topic.Slug;
                this.Name = topic.Name;
            }

            [Required]
            public string Slug { get; set; }

            [Required]
            public string Name { get; set; }
        }
    }
}