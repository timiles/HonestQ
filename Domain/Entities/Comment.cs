using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Comment
    {
        public Comment() { }
        public Comment(string text, AgreementRating agreementRating, User postedByUser, DateTimeOffset postedAt)
        {
            Text = text;
            AgreementRating = agreementRating;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public long Id { get; set; }


        [MaxLength(280)]
        public string Text { get; set; }

        [MaxLength(2000)]
        public string Source { get; set; }

        public AgreementRating AgreementRating { get; set; }

        [Required]
        public User PostedByUser { get; set; }

        public DateTimeOffset PostedAt { get; set; }


        [Required]
        public virtual Statement Statement { get; set; }
    }
}
