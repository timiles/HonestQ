using System.Net;
using System.Net.Mail;

namespace Pobs.Comms
{
    public interface IEmailSender
    {
        void SendEmailVerification(string to, string username, string confirmationUrl);
        void SendNewUserSignedUpNotification(string username);
        void SendQuestionAwaitingApprovalEmail(int questionId, string questionText);
        void SendTagAwaitingApprovalEmail(string tagSlug, string tagName);
        void SendReportQuestionEmail(int reportingUserId, string reason, int questionId, string questionText);
        void SendReportAnswerEmail(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText);
        void SendReportCommentEmail(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText, long commentId, string commentText);
    }
    public class EmailSender : IEmailSender
    {
        private const string SupportEmailAddress = "honestq@pm.me";
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

        public void SendNewUserSignedUpNotification(string username)
        {
            Send(SupportEmailAddress, new NewUserSignedUpNotificationEmailMessage(username));
        }

        public void SendQuestionAwaitingApprovalEmail(int questionId, string questionText)
        {
            Send(SupportEmailAddress, new QuestionAwaitingApprovalEmailMessage(questionId, questionText));
        }

        public void SendTagAwaitingApprovalEmail(string tagSlug, string tagName)
        {
            Send(SupportEmailAddress, new TagAwaitingApprovalEmailMessage(tagSlug, tagName));
        }

        public void SendReportQuestionEmail(int reportingUserId, string reason, int questionId, string questionText)
        {
            Send(SupportEmailAddress, new ReportQuestionEmailMessage(reportingUserId, reason, questionId, questionText));
        }

        public void SendReportAnswerEmail(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText)
        {
            Send(SupportEmailAddress, new ReportAnswerEmailMessage(reportingUserId, reason, questionId, questionText, answerId, answerText));
        }

        public void SendReportCommentEmail(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText, long commentId, string commentText)
        {
            Send(SupportEmailAddress, new ReportCommentEmailMessage(reportingUserId, reason, questionId, questionText, answerId, answerText, commentId, commentText));
        }
    }
}