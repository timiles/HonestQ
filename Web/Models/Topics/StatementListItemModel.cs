using System.Collections.Generic;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class StatementListItemModel
    {
        public StatementListItemModel() { }
        public StatementListItemModel(Statement statement)
        {
            this.Id = statement.Id;
            this.Slug = statement.Slug;
            this.Text = statement.Text;
            this.AgreementRatings = statement.Comments
                .GroupBy(x => x.AgreementRating)
                .ToDictionary(x => x.Key.ToString(), x => x.Count());
        }

        public int Id { get; set; }
        public string Slug { get; set; }
        public string Text { get; set; }
        public Dictionary<string, int> AgreementRatings { get; set; }
    }
}