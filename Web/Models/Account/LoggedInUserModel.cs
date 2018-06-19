using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Account
{
    public class LoggedInUserModel
    {
        public LoggedInUserModel() { }
        public LoggedInUserModel(User user, string token)
        {
            this.FirstName = user.FirstName;
            this.Username = user.Username;
            this.Token = token;

            // TODO: Linux does not have the same time zone IDs. Use Noda time instead?
            // var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            // this.TimeZoneOffsetHours = timeZoneInfo.GetUtcOffset(DateTime.UtcNow).TotalHours;
            this.TimeZoneOffsetHours = 1; // Hard code to BST for now
        }

        public string FirstName { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public double TimeZoneOffsetHours { get; }
    }
}