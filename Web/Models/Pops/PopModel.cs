using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Pops
{
    public class PopModel
    {
        public PopModel() { }
        public PopModel(Pop pop, IEnumerable<Comment> topLevelComments)
        {
            this.Slug = pop.Slug;
            this.Text = pop.Text;
            this.Source = pop.Source;
            this.Type = pop.Type.ToString();
            this.Topics = pop.Topics.Select(x => new TopicValueModel(x)).ToArray();
            this.Comments = topLevelComments.Select(x => new CommentModel(x)).ToArray();
        }

        public string Slug { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string Type { get; set; }
        public TopicValueModel[] Topics { get; set; }
        public CommentModel[] Comments { get; set; }
    }
}