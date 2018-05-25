using System.Collections.Generic;
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
                this.UrlFragment = topic.UrlFragment;
                this.Name = topic.Name;
            }

            public string UrlFragment { get; set; }
            public string Name { get; set; }
        }
    }
}