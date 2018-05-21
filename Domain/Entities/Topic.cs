using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Topic
    {
        public Topic()
        {
            this.Statements = new Collection<Statement>();
        }
        public Topic(string urlFragment, string name, User postedByUser, DateTime postedAt) : this()
        {
            UrlFragment = urlFragment;
            Name = name;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string UrlFragment { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }


        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }


        public virtual ICollection<Statement> Statements { get; set; }
    }
}
