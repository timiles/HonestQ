using System.ComponentModel.DataAnnotations;
using Pobs.Domain;

namespace Pobs.Web.Models.Questions
{
    public class CommentFormModel
    {
        [Required]
        public string Text { get; set; }

        public string Source { get; set; }

        [Required]
        public string AgreementRating { get; set; }

        public long? ParentCommentId { get; set; }

        public bool IsAnonymous { get; set; }
    }
}