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
        }

        public int Id { get; set; }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }
    }
}