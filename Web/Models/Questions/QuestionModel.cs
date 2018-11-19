using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Models.Questions
{
    public class QuestionModel
    {
        public QuestionModel() { }
        public QuestionModel(Question question, int? loggedInUserId)
        {
            this.Slug = question.Slug;
            this.Text = question.Text;
            this.Source = question.Source;
            this.Tags = question.Tags.Select(x => new TagValueModel(x)).ToArray();

            this.PostedBy = question.PostedByUser.Username;
            this.IsPostedByLoggedInUser = question.PostedByUserId == loggedInUserId;

            this.Answers = question.Answers.Select(x => new AnswerModel(x, loggedInUserId)).ToArray();
        }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }

        public string Source { get; set; }

        [Required]
        public string PostedBy { get; set; }

        public bool IsPostedByLoggedInUser { get; set; }

        public TagValueModel[] Tags { get; set; }

        public AnswerModel[] Answers { get; set; }
    }
}