namespace Pobs.Web.Models.Notifications
{
    public class NotificationsCountModel
    {
        public NotificationsCountModel() { }
        public NotificationsCountModel(int count)
        {
            this.Count = count;
        }

        public int Count { get; set; }
    }
}