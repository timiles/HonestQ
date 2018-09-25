using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pobs.Domain.Entities.Helpers;
using Pobs.Domain.Utils;

namespace Pobs.Domain.Entities
{
    public class Question
    {
        public Question()
        {
            this.Topics = new JoinCollectionFacade<Topic, Question, QuestionTopic>(this, this.QuestionTopics);
            this.Answers = new Collection<Answer>();
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

        [Required]
        public virtual User PostedByUser { get; set; }
        public int PostedByUserId { get; set; }

        public DateTime PostedAt { get; set; }


        public virtual ICollection<Answer> Answers { get; set; }

        public ICollection<QuestionTopic> QuestionTopics { get; } = new List<QuestionTopic>();

        public void AddTopic(Topic topic)
        {
            var questionTopic = new QuestionTopic();
            ((IJoinEntity<Topic>)questionTopic).Navigation = topic;
            ((IJoinEntity<Question>)questionTopic).Navigation = this;
            this.QuestionTopics.Add(questionTopic);
        }

        [NotMapped]
        public ICollection<Topic> Topics { get; }
    }
}
