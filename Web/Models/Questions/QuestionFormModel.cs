using System.ComponentModel.DataAnnotations;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Models.Questions
{
    public class QuestionFormModel
    {
        [Required]
        public string Text { get; set; }
        public string Source { get; set; }
        public TagValueFormModel[] Tags { get; set; }


        public class TagValueFormModel
        {
            [Required]
            public string Slug { get; set; }
        }
    }
}