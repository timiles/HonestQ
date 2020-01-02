namespace Pobs.MobileNotifications.Domain.QueryObjects
{
    public class AnswerNotificationToPush
    {
        public long NotificationId { get; set; }
        public string PushToken { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public int AnswerId { get; set; }
        public string AnswerText { get; set; }
    }
}
