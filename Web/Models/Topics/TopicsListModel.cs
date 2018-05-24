namespace Pobs.Web.Models.Topics
{
    public class TopicsListModel
    {
        public TopicListItemModel[] Topics { get; set; }

        public class TopicListItemModel
        {
            public string UrlFragment { get; set; }
            public string Name { get; set; }
        }
    }
}