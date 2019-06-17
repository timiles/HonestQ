using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Tags
{
    public class TagValueModel
    {
        public TagValueModel() { }
        public TagValueModel(Tag tag)
        {
            this.Name = tag.Name;
            this.Slug = tag.Slug;
        }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Slug { get; set; }
    }
}