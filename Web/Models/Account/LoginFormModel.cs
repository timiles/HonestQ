using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Account
{
    public class LoginFormModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }
}