using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Reaction
    {
        public Reaction() { }
        public Reaction(ReactionType type, int postedByUserId, DateTimeOffset postedAt) : this()
        {
            this.Type = type;
            this.PostedByUserId = postedByUserId;
            this.PostedAt = postedAt;
        }

        public long Id { get; set; }

        [Required]
        public ReactionType Type { get; set; }

        [Required]
        public User PostedByUser { get; set; }
        public int PostedByUserId { get; set; }

        public DateTimeOffset PostedAt { get; set; }


        public virtual Answer Answer { get; set; }
        public int? AnswerId { get; set; }
        public virtual Comment Comment { get; set; }
        public long? CommentId { get; set; }
    }
}
