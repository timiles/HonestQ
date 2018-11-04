using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Account
{
    public class VerifyEmailResponseModel
    {
        [Required]
        public string Username { get; set; }
    }
}