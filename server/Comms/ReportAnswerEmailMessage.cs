namespace Pobs.Comms
{
    internal class ReportAnswerEmailMessage : IEmailMessage
    {
        private readonly int _reportingUserId;
        private readonly string _reason;
        private readonly int _questionId;
        private readonly string _questionText;
        private readonly int _answerId;
        private readonly string _answerText;

        public ReportAnswerEmailMessage(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText)
        {
            _reportingUserId = reportingUserId;
            _reason = reason;
            _questionId = questionId;
            _questionText = questionText;
            _answerId = answerId;
            _answerText = answerText;
        }

        public string From => "noreply@honestq.com";

        public string Subject => "⚠ Answer reported!";

        public string BodyHtml => $@"<h1>⚠ Answer reported!</h1>
<p>Reported by UserId: {_reportingUserId}</p>
<p>Reason: {_reason}</p>
<p>Question: {_questionText}</p>
<p>Answer: {_answerText}</p>
<p><a href=""https://www.honestq.com/questions/{_questionId}/answers/{_answerId}"">Link</a></p>";
    }
}