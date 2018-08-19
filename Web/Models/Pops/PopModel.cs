using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Pops
{
    public class PopModel
    {
        private static IDictionary<int, int> PseudonymiseUserIds(Pop pop)
        {
            var pseudoIds = new Dictionary<int, int>();
            int pseudoId = 0;

            // Original poster of the Pop is always pseudoId 0
            pseudoIds.Add(pop.PostedByUserId, pseudoId++);

            foreach (var comment in pop.Comments.OrderBy(x => x.PostedAt))
            {
                if (!pseudoIds.ContainsKey(comment.PostedByUserId))
                {
                    pseudoIds.Add(comment.PostedByUserId, pseudoId++);
                }
            }

            return pseudoIds;
        }

        public PopModel() { }
        public PopModel(Pop pop)
        {
            this.Slug = pop.Slug;
            this.Text = pop.Text;
            this.Source = pop.Source;
            this.Type = pop.Type.ToString();
            this.Topics = pop.PopTopics.Select(x => new TopicValueStanceModel(x)).ToArray();

            var pseudoIds = PseudonymiseUserIds(pop);

            var topLevelComments = pop.Comments.Where(x => x.ParentComment == null);
            this.Comments = topLevelComments.Select(x => new CommentModel(x, pseudoIds)).ToArray();
        }

        public string Slug { get; set; }
        public string Text { get; set; }
        public string Source { get; set; }
        public string Type { get; set; }
        public TopicValueStanceModel[] Topics { get; set; }
        public CommentModel[] Comments { get; set; }
    }
}