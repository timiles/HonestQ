using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class Tag : IHasWatches
    {
        public Tag()
        {
            this.Watches = new Collection<Watch>();
            this.Questions = new JoinCollectionFacade<Question, Tag, QuestionTag>(this, this.QuestionTags);
        }
        public Tag(string slug, string name, User postedByUser, DateTime postedAt) : this()
        {
            this.Slug = slug;
            this.Name = name;
            this.PostedByUser = postedByUser;
            this.PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Slug { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(280)]
        public string Description { get; set; }

        [MaxLength(2000)]
        public string MoreInfoUrl { get; set; }


        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }

        public bool IsApproved { get; set; }

        public virtual ICollection<Watch> Watches { get; set; }

        public ICollection<QuestionTag> QuestionTags { get; } = new List<QuestionTag>();

        public void AddQuestion(Question question)
        {
            var questionTag = new QuestionTag();
            ((IJoinEntity<Question>)questionTag).Navigation = question;
            ((IJoinEntity<Tag>)questionTag).Navigation = this;
            this.QuestionTags.Add(questionTag);
        }

        [NotMapped]
        public ICollection<Question> Questions { get; }
    }
}
