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
            this.Id = question.Id;
            this.Slug = question.Slug;
            this.Text = question.Text;
            this.Context = question.Context;
            this.Tags = question.Tags.Where(x => x.IsApproved).Select(x => new TagValueModel(x)).ToArray();

            this.PostedBy = question.PostedByUser.Username;
            this.Watching = question.Watches.Any(x => x.UserId == loggedInUserId);

            this.Answers = question.Answers.Select(x => new AnswerModel(x, loggedInUserId)).ToArray();
        }

        public int Id { get; set; }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }

        public string Context { get; set; }

        [Required]
        public string PostedBy { get; set; }

        public bool Watching { get; set; }

        public TagValueModel[] Tags { get; set; }

        public AnswerModel[] Answers { get; set; }
    }
}