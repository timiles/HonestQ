namespace Pobs.Comms
{
    internal class ReportQuestionEmailMessage : IEmailMessage
    {
        private readonly int _reportingUserId;
        private readonly string _reason;
        private readonly int _questionId;
        private readonly string _questionText;

        public ReportQuestionEmailMessage(int reportingUserId, string reason, int questionId, string questionText)
        {
            _reportingUserId = reportingUserId;
            _reason = reason;
            _questionId = questionId;
            _questionText = questionText;
        }

        public string From => "noreply@honestq.com";

        public string Subject => "⚠ Question reported!";

        public string BodyHtml => $@"<h1>⚠ Question reported!</h1>
<p>Reported by UserId: {_reportingUserId}</p>
<p>Reason: {_reason}</p>
<p>Question: {_questionText}</p>
<p><a href=""https://www.honestq.com/questions/{_questionId}"">Link</a></p>";
    }
}