using System.ComponentModel.DataAnnotations;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Models.Questions
{
    public class QuestionFormModel
    {
        [Required]
        public string Text { get; set; }
        public string Source { get; set; }
        public TopicValueFormModel[] Topics { get; set; }


        public class TopicValueFormModel
        {
            [Required]
            public string Slug { get; set; }
        }
    }
}