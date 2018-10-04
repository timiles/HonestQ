using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models
{
    public class IntroModel
    {
        [Required]
        public string Content { get; set; }
    }
}