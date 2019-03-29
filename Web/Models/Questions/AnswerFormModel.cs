using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Questions
{
    public class AnswerFormModel
    {
        [Required]
        public string Text { get; set; }
    }
}