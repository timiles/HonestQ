using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Notifications
{
    public class WatchFormModel
    {
        [Required]
        public string Method { get; set; }

        [Required]
        public string Type { get; set; }

        public long Id { get; set; }
    }
}