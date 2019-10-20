namespace Pobs.Domain.QueryObjects
{
    public class CommentNotificationToPush
    {
        public long NotificationId { get; set; }
        public string PushToken { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public int AnswerId { get; set; }
        public string AnswerText { get; set; }
        public long CommentId { get; set; }
        public string CommentText { get; set; }
    }
}
