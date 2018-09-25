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
        }

        public QuestionListItemModel[] Questions { get; set; }
    }
}