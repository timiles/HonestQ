using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Topic
    {
        public Topic() { }
        public Topic(string urlFragment, string name, User postedByUser, DateTime postedAt)
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
    }
}
