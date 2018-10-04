using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Topics
{
    public class TopicFormModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Summary { get; set; }

        public string MoreInfoUrl { get; set; }
    }
}