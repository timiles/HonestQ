using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Utils;

namespace Pobs.Domain.Entities
{
    public class Answer : IHasWatches
    {
        public Answer()
        {
            this.Comments = new Collection<Comment>();
            this.Reactions = new Collection<Reaction>();
            this.Watches = new Collection<Watch>();
        }
        public Answer(string text, User postedByUser, DateTimeOffset postedAt) : this()
        {
            this.Text = text.CleanText();
            this.Slug = text.ToSlug();
            this.PostedByUser = postedByUser;
            this.PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(280)]
        public string Text { get; set; }

        [Required, MaxLength(280)]
        public string Slug { get; set; }

        [Required]
        public User PostedByUser { get; set; }
        public int PostedByUserId { get; set; }

        public DateTimeOffset PostedAt { get; set; }


        [Required]
        public virtual Question Question { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Reaction> Reactions { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Watch> Watches { get; set; }
    }
}
