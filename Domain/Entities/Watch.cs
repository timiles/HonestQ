using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Watch
    {
        public Watch() { }
        public Watch(int userId) : this()
        {
            this.UserId = userId;
        }

        public long Id { get; set; }

        [Required]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        public virtual Tag Tag { get; set; }
        public int? TagId { get; set; }

        public virtual Question Question { get; set; }
        public int? QuestionId { get; set; }

        public virtual Answer Answer { get; set; }
        public int? AnswerId { get; set; }

        public virtual Comment Comment { get; set; }
        public long? CommentId { get; set; }
    }
}
