using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Statement
    {
        public Statement() { }
        public Statement(string text, User postedByUser, DateTime postedAt)
        {
            Text = text;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(280)]
        public string Text { get; set; }

        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }
    }
}
