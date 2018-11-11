using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Tags
{
    public class TagAutocompleteResultsModel
    {
        public TagAutocompleteResultsModel()
        {
        }
        public TagAutocompleteResultsModel(Tag[] tag)
        {
            this.Values = tag.Select(x => new TagValueModel(x)).ToArray();
        }

        public TagValueModel[] Values { get; set; }
    }
}