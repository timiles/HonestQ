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
    public class Statement
    {
        public Statement()
        {
            this.Topics = new JoinCollectionFacade<Topic, Statement, StatementTopic>(this, this.StatementTopics);
            this.Comments = new Collection<Comment>();
        }
        public Statement(string text, User postedByUser, DateTime postedAt) : this()
        {
            Text = text.CleanStatementText();
            Slug = Text.ToSlug();
            PostedByUser = postedByUser;
            PostedAt = postedAt;
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

        public Stance Stance { get; set; }


        internal ICollection<StatementTopic> StatementTopics { get; } = new List<StatementTopic>();

        [NotMapped]
        public ICollection<Topic> Topics { get; }

        public virtual ICollection<Comment> Comments { get; set; }
    }
}
