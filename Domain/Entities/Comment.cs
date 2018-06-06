using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Comment
    {
        public Comment() { }
        public Comment(string text, AgreementRating agreementRating, User postedByUser, DateTime postedAt)
        {
            Text = text;
            AgreementRating = agreementRating;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public long Id { get; set; }


        [Required, MaxLength(280)]
        public string Text { get; set; }

        public AgreementRating AgreementRating { get; set; }

        [Required]
        public User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }


        [Required]
        public virtual Statement Statement { get; set; }
    }
}
