using System;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Notifications
{
    public class NotificationsListModel
    {
        public NotificationsListModel() { }
        public NotificationsListModel(Notification[] notifications)
        {
            this.Notifications = notifications.Select(x =>
            {
                if (x.Question != null) return new NotificationModel(x.Question);
                if (x.Answer != null) return new NotificationModel(x.Answer);
                if (x.Comment != null) return new NotificationModel(x.Comment);
                throw new NotImplementedException("No notification object: Id = " + x.Id);
            }).ToArray();
            this.LastId = notifications.Any() ? notifications.Min(x => x.Id) : 0;
        }

        public NotificationModel[] Notifications { get; set; }
        public long LastId { get; set; }
    }
}