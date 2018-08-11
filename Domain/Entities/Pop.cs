using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Pobs.Domain.Entities.Helpers;
using Pobs.Domain.Utils;

namespace Pobs.Domain.Entities
{
    public class Pop
    {
        public Pop()
        {
            this.Topics = new JoinCollectionFacade<Topic, Pop, PopTopic>(this, this.PopTopics);
            this.Comments = new Collection<Comment>();
        }
        public Pop(string text, User postedByUser, DateTime postedAt, PopType type) : this()
        {
            Text = text.CleanPopText();
            Slug = Text.ToSlug();
            PostedByUser = postedByUser;
            PostedAt = postedAt;
            Type = type;
        }

        public int Id { get; set; }

        [Required, MaxLength(280)]
        public string Slug { get; set; }

        [Required, MaxLength(280)]
        public string Text { get; set; }

        [MaxLength(2000)]
        public string Source { get; set; }

        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }

        public PopType Type { get; set; }

        public ICollection<PopTopic> PopTopics { get; } = new List<PopTopic>();

        [NotMapped]
        public ICollection<Topic> Topics { get; }

        public virtual ICollection<Comment> Comments { get; set; }
    }
}
