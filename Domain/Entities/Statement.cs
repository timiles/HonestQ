using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Utils;

namespace Pobs.Domain.Entities
{
    public class Statement
    {
        public Statement()
        {
            this.Comments = new Collection<Comment>();
        }
        public Statement(string text, User postedByUser, DateTime postedAt) : this()
        {
            Slug = text.ToSlug();
            Text = text;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(280)]
        public string Slug { get; set; }

        [Required, MaxLength(280)]
        public string Text { get; set; }

        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }


        [Required]
        public virtual Topic Topic { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }
    }
}
