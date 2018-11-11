using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Tags
{
    public class TagFormModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        public string MoreInfoUrl { get; set; }
    }
}