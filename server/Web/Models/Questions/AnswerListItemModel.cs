using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class AnswerListItemModel
    {
        public AnswerListItemModel() { }
        public AnswerListItemModel(Answer answer)
        {
            this.Id = answer.Id;
            this.Slug = answer.Slug;
            this.Text = answer.Text;
            this.QuestionId = answer.Question.Id;
            this.QuestionText = answer.Question.Text;
        }

        public int Id { get; set; }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }

        public int QuestionId { get; set; }

        [Required]
        public string QuestionText { get; set; }
    }
}