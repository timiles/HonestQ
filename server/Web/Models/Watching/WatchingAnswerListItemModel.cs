using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Watching
{
    public class WatchingAnswerListItemModel
    {
        public WatchingAnswerListItemModel() { }
        public WatchingAnswerListItemModel(Watch watch)
        {
            this.WatchId = watch.Id;

            var answer = watch.Answer;
            this.AnswerId = answer.Id;
            this.AnswerSlug = answer.Slug;
            this.AnswerText = answer.Text;
      
            var question = answer.Question;
            this.QuestionId = question.Id;
            this.QuestionSlug = question.Slug;
            this.QuestionText = question.Text;
        }

        public long WatchId { get; set; }

        public int QuestionId { get; set; }

        [Required]
        public string QuestionSlug { get; set; }

        [Required]
        public string QuestionText { get; set; }

        public int AnswerId { get; set; }

        [Required]
        public string AnswerSlug { get; set; }

        [Required]
        public string AnswerText { get; set; }
    }
}