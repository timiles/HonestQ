using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Account
{
    public class VerifyEmailFormModel
    {
        public int UserId { get; set; }

        [Required]
        public string EmailVerificationToken { get; set; }
    }
}