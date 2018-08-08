using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class TopicAutocompleteResultsModel
    {
        public TopicAutocompleteResultsModel()
        {
        }
        public TopicAutocompleteResultsModel(Topic[] topic)
        {
            this.Values = topic.Select(x => new TopicValueModel(x)).ToArray();
        }

        public TopicValueModel[] Values { get; set; }
    }
}