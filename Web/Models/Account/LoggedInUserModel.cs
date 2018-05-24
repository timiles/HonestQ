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
        }

        public string FirstName { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
    }
}