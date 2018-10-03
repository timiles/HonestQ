using System;
using System.Collections.Generic;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Activity
{
    public class ActivityListItemModel
    {
        public ActivityListItemModel() { }
        public ActivityListItemModel(Question x)
        {
            this.Type = "Question";
            this.QuestionId = x.Id;
            this.QuestionSlug = x.Slug;
            this.QuestionText = x.Text;
            this.PostedAt = x.PostedAt.UtcDateTime;
            this.ChildCount = x.Answers.Count;
        }

        public ActivityListItemModel(Answer x) : this(x.Question)
        {
            this.Type = "Answer";
            this.QuestionId = x.Question.Id;
            this.QuestionSlug = x.Question.Slug;
            this.AnswerId = x.Id;
            this.AnswerSlug = x.Slug;
            this.AnswerText = x.Text;
            this.PostedAt = x.PostedAt.UtcDateTime;
            this.ChildCount = x.Comments.Count;
        }

        public ActivityListItemModel(Comment x) : this(x.Answer)
        {
            this.Type = "Comment";
            this.QuestionId = x.Answer.Question.Id;
            this.QuestionSlug = x.Answer.Question.Slug;
            this.AnswerId = x.Answer.Id;
            this.AnswerSlug = x.Answer.Slug;
            this.CommentId = x.Id;
            this.CommentText = x.Text;
            this.PostedAt = x.PostedAt.UtcDateTime;
            this.AgreementRating = x.AgreementRating.ToString();
        }

        public string Type { get; set; }
        public int QuestionId { get; set; }
        public string QuestionSlug { get; set; }
        public string QuestionText { get; set; }

        public int? AnswerId { get; set; }
        public string AnswerSlug { get; set; }
        public string AnswerText { get; set; }

        public long? CommentId { get; set; }
        public string CommentText { get; set; }

        public DateTime PostedAt { get; set; }
        public int? ChildCount { get; set; }
        public string AgreementRating { get; set; }
    }
}