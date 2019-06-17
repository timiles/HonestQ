namespace Pobs.Comms
{
    internal class NewUserSignedUpNotificationEmailMessage : IEmailMessage
    {
        private readonly string _username;

        internal NewUserSignedUpNotificationEmailMessage(string username)
        {
            _username = username;
        }

        public string From => "accounts@honestq.com";

        public string Subject => $"New HonestQ.com user!";

        public string BodyHtml => $"<h1>New HonestQ.com user account: {_username}. Hooray!</h1>";
    }
}