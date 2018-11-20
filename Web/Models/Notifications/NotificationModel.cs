using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Models.Notifications
{
    public class NotificationModel
    {
        public NotificationModel() { }
        public NotificationModel(Question x)
        {
            this.Type = "Question";
            this.QuestionId = x.Id;
            this.QuestionSlug = x.Slug;
            this.QuestionText = x.Text;
            this.PostedAt = x.PostedAt.UtcDateTime;
            this.Tags = x.Tags?.Select(y => new TagValueModel(y)).ToArray();
        }

        public NotificationModel(Answer x) : this(x.Question)
        {
            this.Type = "Answer";
            this.QuestionId = x.Question.Id;
            this.QuestionSlug = x.Question.Slug;
            this.AnswerId = x.Id;
            this.AnswerSlug = x.Slug;
            this.AnswerText = x.Text;
            this.PostedAt = x.PostedAt.UtcDateTime;
        }

        public NotificationModel(Comment x) : this(x.Answer)
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

        [Required]
        public string Type { get; set; }

        public int QuestionId { get; set; }

        [Required]
        public string QuestionSlug { get; set; }

        [Required]
        public string QuestionText { get; set; }

        public int? AnswerId { get; set; }
        public string AnswerSlug { get; set; }
        public string AnswerText { get; set; }

        public long? CommentId { get; set; }
        public string CommentText { get; set; }

        public DateTime PostedAt { get; set; }
        public string AgreementRating { get; set; }

        public TagValueModel[] Tags { get; set; }
    }
}