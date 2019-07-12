using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Notifications
{
    public class PushTokenModel
    {
        [Required]
        public string Token { get; set; }
    }
}
