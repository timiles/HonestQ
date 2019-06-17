using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class QuestionsListModel
    {
        public QuestionsListModel() { }
        public QuestionsListModel(IEnumerable<Question> questions)
        {
            this.Questions = questions.Select(x => new QuestionListItemModel(x)).ToArray();
            this.LastTimestamp = questions.Any() ? questions.Min(x => x.PostedAt).ToUnixTimeMilliseconds() : 0;
        }

        public QuestionListItemModel[] Questions { get; set; }
        public long LastTimestamp { get; set; }
    }
}