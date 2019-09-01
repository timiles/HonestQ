using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Watching
{
    public class WatchingQuestionListItemModel
    {
        public WatchingQuestionListItemModel() { }
        public WatchingQuestionListItemModel(Watch watch)
        {
            this.WatchId = watch.Id;

            var question = watch.Question;
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
    }
}