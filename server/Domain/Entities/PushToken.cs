using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class PushToken
    {
        public PushToken() { }
        public PushToken(string token)
        {
            this.Token = token;
        }

        [Required, Key, StringLength(2000)]
        public string Token { get; set; }

        public int? UserId { get; set; }
        public User User { get; set; }
    }
}