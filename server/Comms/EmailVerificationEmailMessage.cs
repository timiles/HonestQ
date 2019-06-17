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

        public string Subject => $"Verify your HonestQ.com account, {_username}.";

        public string BodyHtml => $@"
            <h1>Verify your HonestQ.com account, {_username}.</h1>
            <p>Click the link below to verify your email address:</p>
            <p><a href=""{_verifyUrl}"">Verify</a></p>
            <p>HonestQ.com</p>
            <small>Didn't sign up to HonestQ.com? Simply ignore this email and you won't hear from us again.</small>
            ";
    }
}