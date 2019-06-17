using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Tags
{
    public class EditTagFormModel
    {
        [Required]
        public string Slug { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string MoreInfoUrl { get; set; }

        public bool IsApproved { get; set; }
    }
}