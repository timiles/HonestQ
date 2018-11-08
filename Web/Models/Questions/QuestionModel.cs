using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Questions
{
    public class QuestionModel
    {
        public QuestionModel() { }
        public QuestionModel(Question question, int? loggedInUserId = null)
        {
            this.Slug = question.Slug;
            this.Text = question.Text;
            this.Source = question.Source;
            this.Topics = question.Topics.Select(x => new TopicValueModel(x)).ToArray();

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

        public TopicValueModel[] Topics { get; set; }

        public AnswerModel[] Answers { get; set; }
    }
}