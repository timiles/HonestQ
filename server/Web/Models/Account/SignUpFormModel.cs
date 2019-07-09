using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Account
{
    public class SignUpFormModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public string Email { get; set; }
    }
}