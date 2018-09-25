﻿using System;
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
            this.Questions = new JoinCollectionFacade<Question, Topic, QuestionTopic>(this, this.QuestionTopics);
        }
        public Topic(string slug, string name, User postedByUser, DateTime postedAt) : this()
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
        public string Summary { get; set; }

        [MaxLength(2000)]
        public string MoreInfoUrl { get; set; }


        [Required]
        public virtual User PostedByUser { get; set; }

        public DateTime PostedAt { get; set; }

        public bool IsApproved { get; set; }


        public ICollection<QuestionTopic> QuestionTopics { get; } = new List<QuestionTopic>();

        public void AddQuestion(Question question)
        {
            var questionTopic = new QuestionTopic();
            ((IJoinEntity<Question>)questionTopic).Navigation = question;
            ((IJoinEntity<Topic>)questionTopic).Navigation = this;
            this.QuestionTopics.Add(questionTopic);
        }

        [NotMapped]
        public ICollection<Question> Questions { get; }
    }
}
