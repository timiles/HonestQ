namespace Pobs.Comms
{
    internal class EmailVerificationEmailMessage : IEmailMessage
    {
        private readonly string _username;
        private readonly string _verifyUrl;

        internal EmailVerificationEmailMessage(string username, string verifyUrl)
        {
        _username = username;
        _verifyUrl = verifyUrl;
        }

        public string From => "verify@honestq.com";

        public string Subject => $"Verify your HonestQ account, {_username}.";

        public string BodyHtml => $@"
                <h2>Hi {_username},</h2>
                <p>Click the link below to verify your email address:</p>
                <p><a href=""{_verifyUrl}"">Verify</a></p>
                <p>HonestQ</p>
                <small>Didn't sign up to HonestQ? Simply ignore this email and you won't hear from us again.</small>
                ";
    }
}