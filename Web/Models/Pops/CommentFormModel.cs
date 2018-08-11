using Pobs.Domain;

namespace Pobs.Web.Models.Pops
{
    public class CommentFormModel
    {
        public string Text { get; set; }
        public string Source { get; set; }
        public string AgreementRating { get; set; }
        public long? ParentCommentId { get; set; }
    }
}