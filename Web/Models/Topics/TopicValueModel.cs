using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Topics
{
    public class TopicValueModel
    {
        public TopicValueModel() { }
        public TopicValueModel(Topic topic)
        {
            this.Name = topic.Name;
            this.Slug = topic.Slug;
        }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Slug { get; set; }
    }
}