using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Topics
{
    public class EditTopicFormModel
    {
        [Required]
        public string Slug { get; set; }

        [Required]
        public string Name { get; set; }

        public string Summary { get; set; }

        public string MoreInfoUrl { get; set; }

        public bool IsApproved { get; set; }
    }
}