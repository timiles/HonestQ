using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pobs.Domain.Entities.Helpers;
using Pobs.Domain.Utils;

namespace Pobs.Domain.Entities
{
    public class Question : IHasWatches
    {
        public Question()
        {
            this.Tags = new JoinCollectionFacade<Tag, Question, QuestionTag>(this, this.QuestionTags);
            this.Answers = new Collection<Answer>();
            this.Watches = new Collection<Watch>();
        }
        public Question(string text, User postedByUser, DateTime postedAt) : this()
        {
            this.Text = text;
            this.Slug = text.ToSlug();
            this.PostedByUser = postedByUser;
            this.PostedAt = postedAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(280)]
        public string Slug { get; set; }

        [Required, MaxLength(280)]
        public string Text { get; set; }

        [MaxLength(2000)]
        public string Source { get; set; }

        [MaxLength(2000)]
        public string Context { get; set; }

        [Required]
        public virtual User PostedByUser { get; set; }
        public int PostedByUserId { get; set; }

        public DateTimeOffset PostedAt { get; set; }

        public PostStatus Status { get; set; }


        public virtual ICollection<Answer> Answers { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Watch> Watches { get; set; }

        public ICollection<QuestionTag> QuestionTags { get; } = new List<QuestionTag>();

        public void AddTag(Tag tag)
        {
            var questionTag = new QuestionTag();
            ((IJoinEntity<Tag>)questionTag).Navigation = tag;
            ((IJoinEntity<Question>)questionTag).Navigation = this;
            this.QuestionTags.Add(questionTag);
        }

        [NotMapped]
        public ICollection<Tag> Tags { get; }
    }
}
