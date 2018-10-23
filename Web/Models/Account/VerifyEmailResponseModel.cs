using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Account
{
    public class VerifyEmailResponseModel
    {
        public bool Success { get; set; }

        [Required]
        public string Error { get; set; }
    }
}