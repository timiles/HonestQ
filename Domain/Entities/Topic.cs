using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class Topic
    {
        public Topic()
        {
            this.Pops = new JoinCollectionFacade<Pop, Topic, PopTopic>(this, this.PopTopics);
        }
        public Topic(string slug, string name, User postedByUser, DateTime postedAt) : this()
        {
            Slug = slug;
            Name = name;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Slug { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(280)]
        public string Summary { get; set; }

        [MaxLength(2000)]
        public string MoreInfoUrl { get; set; }


        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }

        public bool IsApproved { get; set; }


        public ICollection<PopTopic> PopTopics { get; } = new List<PopTopic>();

        public void AddPop(Pop pop, Stance? stance = null)
        {
            var popTopic = new PopTopic();
            ((IJoinEntity<Pop>)popTopic).Navigation = pop;
            ((IJoinEntity<Topic>)popTopic).Navigation = this;
            popTopic.Stance = stance;
            this.PopTopics.Add(popTopic);
        }

        [NotMapped]
        public ICollection<Pop> Pops { get; }
    }
}
