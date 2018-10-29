using System.ComponentModel.DataAnnotations;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Account
{
    public class LoggedInUserModel
    {
        public LoggedInUserModel() { }
        public LoggedInUserModel(User user, string token)
        {
            this.Name = user.Name;
            this.Username = user.Username;
            this.Token = token;

            // TODO: Linux does not have the same time zone IDs. Use Noda time instead?
            // var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            // this.TimeZoneOffsetHours = timeZoneInfo.GetUtcOffset(DateTime.UtcNow).TotalHours;
            this.TimeZoneOffsetHours = 0; // Hard code to GMT for now
        }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Token { get; set; }

        public double TimeZoneOffsetHours { get; }
    }
}