using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Notifications
{
    public class NotificationsListModel
    {
        public NotificationsListModel() { }
        public NotificationsListModel(Notification[] notifications)
        {
            this.Notifications = notifications.Select(x => new NotificationModel(x)).ToArray();
            this.LastId = notifications.Any() ? notifications.Min(x => x.Id) : 0;
        }

        public NotificationModel[] Notifications { get; set; }
        public long LastId { get; set; }
    }
}