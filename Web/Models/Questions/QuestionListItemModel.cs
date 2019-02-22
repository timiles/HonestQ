using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Tags;

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
            this.Tags = question.Tags.Where(x => x.IsApproved).Select(x => new TagValueModel(x)).ToArray();
            this.AnswersCount = question.Answers.Count();
        }

        public int Id { get; set; }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }

        public TagValueModel[] Tags { get; set; }

        public int AnswersCount { get; set; }
    }
}