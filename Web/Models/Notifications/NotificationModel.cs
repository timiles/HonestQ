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

        public NotificationModel(Notification notification)
        {
            this.Id = notification.Id;
            this.Seen = notification.Seen;
            this.Type = GetNotificationType(notification);

            var question = notification.Question ?? notification.Answer?.Question ?? notification.Comment.Answer.Question;
            this.QuestionId = question.Id;
            this.QuestionSlug = question.Slug;
            this.QuestionText = question.Text;
            this.PostedAt = question.PostedAt.UtcDateTime;
            this.Tags = question.Tags?.Select(y => new TagValueModel(y)).ToArray();

            var answer = notification.Answer ?? notification.Comment?.Answer;
            if (answer != null)
            {
                this.AnswerId = answer.Id;
                this.AnswerSlug = answer.Slug;
                this.AnswerText = answer.Text;
                this.PostedAt = answer.PostedAt.UtcDateTime;
            }

            if (notification.Comment != null)
            {
                this.CommentId = notification.Comment.Id;
                this.CommentText = notification.Comment.Text;
                this.PostedAt = notification.Comment.PostedAt.UtcDateTime;
                this.AgreementRating = notification.Comment.AgreementRating.ToString();
            }
        }

        private static string GetNotificationType(Notification notification)
        {
            if (notification.Question != null)
            {
                return "Question";
            }
            else if (notification.Answer != null)
            {
                return "Answer";
            }
            else if (notification.Comment != null)
            {
                return "Comment";
            }
            else
            {
                throw new NotImplementedException("No notification object: Id = " + notification.Id);
            }
        }

        public long Id { get; set; }

        public bool Seen { get; set; }

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