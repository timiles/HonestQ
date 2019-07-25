using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class AnswersListModel
    {
        public AnswersListModel() { }
        public AnswersListModel(IEnumerable<Answer> answers)
        {
            this.Answers = answers.Select(x => new AnswerListItemModel(x)).ToArray();
            this.LastTimestamp = answers.Any() ? answers.Min(x => x.PostedAt).ToUnixTimeMilliseconds() : 0;
        }

        public AnswerListItemModel[] Answers { get; set; }
        public long LastTimestamp { get; set; }
    }
}