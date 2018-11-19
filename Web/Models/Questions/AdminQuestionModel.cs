using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Questions;

namespace Pobs.Web.Models.Questions
{
    public class AdminQuestionModel : QuestionModel
    {
        public AdminQuestionModel() : base() { }
        public AdminQuestionModel(Question question, int? loggedInUserId) : base(question, loggedInUserId)
        {
            this.IsApproved = (question.Status == PostStatus.OK);
        }

        public bool IsApproved { get; set; }
    }
}