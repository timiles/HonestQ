using System.Collections.Generic;
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
        }

        public int Id { get; set; }
        public string Slug { get; set; }
        public string Text { get; set; }
    }
}