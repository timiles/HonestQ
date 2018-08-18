using System.Collections.Generic;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Pops
{
    public class PopListItemModel
    {
        public PopListItemModel() { }
        public PopListItemModel(Pop pop)
        {
            this.Id = pop.Id;
            this.Slug = pop.Slug;
            this.Text = pop.Text;
            this.Type = pop.Type.ToString();
            this.Topics = pop.PopTopics.Select(x => new TopicValueStanceModel(x)).ToArray();
            this.AgreementRatings = pop.Comments
                .GroupBy(x => x.AgreementRating)
                .ToDictionary(x => x.Key.ToString(), x => x.Count());
        }

        public int Id { get; set; }
        public string Slug { get; set; }
        public string Text { get; set; }
        public string Type { get; set; }
        public TopicValueStanceModel[] Topics { get; set; }
        public Dictionary<string, int> AgreementRatings { get; set; }
    }
}