namespace Pobs.MobileNotifications.Domain.QueryObjects
{
    public class QuestionNotificationToPush
    {
        public long NotificationId { get; set; }
        public string PushToken { get; set; }
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public string TagNames { get; set; }
    }
}
