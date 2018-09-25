using System.Collections.Generic;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Questions
{
    public class QuestionListItemModel
    {
        public QuestionListItemModel() { }
        public QuestionListItemModel(Question question)
        {
            this.Id = question.Id;
            this.Slug = question.Slug;
            this.Text = question.Text;
            this.Topics = question.Topics.Select(x => new TopicValueModel(x)).ToArray();
            this.AnswersCount = question.Answers.Count();
        }

        public int Id { get; set; }
        public string Slug { get; set; }
        public string Text { get; set; }
        public TopicValueModel[] Topics { get; set; }
        public int AnswersCount { get; set; }
    }
}