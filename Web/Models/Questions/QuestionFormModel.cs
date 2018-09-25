using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Questions
{
    public class QuestionFormModel
    {
        public string Text { get; set; }
        public string Source { get; set; }
        public TopicValueModel[] Topics { get; set; }
    }
}