using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Questions
{
    public class AnswerFormModel
    {
        [Required]
        public string Text { get; set; }

        public string CommentText { get; set; }

        public string CommentSource { get; set; }
    }
}