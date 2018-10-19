using System.Net;
using System.Net.Mail;

namespace Pobs.Comms
{
    public interface IEmailSender
    {
        void SendEmailVerification(string to, string username, string confirmationUrl);
    }
    public class EmailSender : IEmailSender
    {
        private readonly string _username;
        private readonly string _password;
        private readonly string _host;
        private readonly int _port;

        public EmailSender(IEmailSenderConfig config)
        {
            _username = config.SmtpUsername;
            _password = config.SmtpPassword;
            _host = config.SmtpHost;
            _port = config.SmtpPort;
        }

        private void Send(string to, IEmailMessage email)
        {
            var message = new MailMessage
            {
                IsBodyHtml = true,
                From = new MailAddress(email.From, "HonestQ"),
                Subject = email.Subject,
                Body = email.BodyHtml,
            };
            message.To.Add(new MailAddress(to));

            using (var client = new SmtpClient(_host, _port))
            {
                client.Credentials = new NetworkCredential(_username, _password);
                client.EnableSsl = true;

                // Allow exception to be thrown if fails.
                client.Send(message);
            }
        }

        public void SendEmailVerification(string to, string username, string verifyUrl)
        {
            Send(to, new EmailVerificationEmailMessage(username, verifyUrl));
        }
    }
}