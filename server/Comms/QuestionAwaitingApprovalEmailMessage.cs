namespace Pobs.Comms
{
    internal class QuestionAwaitingApprovalEmailMessage : IEmailMessage
    {
        private readonly int _questionId;
        private readonly string _questionText;

        internal QuestionAwaitingApprovalEmailMessage(int questionId, string questionText)
        {
            _questionId = questionId;
            _questionText = questionText;
        }

        public string From => "noreply@honestq.com";

        public string Subject => $"Question awaiting approval!";

        public string BodyHtml => $@"<h1>Question awaiting approval!</h1>
<p>{_questionText}</p>
<p><a href=""https://www.honestq.com/admin/edit/questions/{_questionId}"">Link</a></p>";

    }
}