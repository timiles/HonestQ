namespace Pobs.Comms
{
    internal class ReportCommentEmailMessage : IEmailMessage
    {
        private readonly int _reportingUserId;
        private readonly string _reason;
        private readonly int _questionId;
        private readonly string _questionText;
        private readonly int _answerId;
        private readonly string _answerText;
        private readonly long _commentId;
        private readonly string _commentText;

        public ReportCommentEmailMessage(int reportingUserId, string reason, int questionId, string questionText, int answerId, string answerText, long commentId, string commentText)
        {
            _reportingUserId = reportingUserId;
            _reason = reason;
            _questionId = questionId;
            _questionText = questionText;
            _answerId = answerId;
            _answerText = answerText;
            _commentId = commentId;
            _commentText = commentText;
        }

        public string From => "noreply@honestq.com";

        public string Subject => "⚠ Comment reported!";

        public string BodyHtml => $@"<h1>⚠ Comment reported!</h1>
<p>Reported by UserId: {_reportingUserId}</p>
<p>Reason: {_reason}</p>
<p>Question: {_questionText}</p>
<p>Answer: {_answerText}</p>
<p>Comment: {_commentText}</p>
<p><a href=""https://www.honestq.com/questions/{_questionId}/answers/{_answerId}"">Link</a></p>";
    }
}