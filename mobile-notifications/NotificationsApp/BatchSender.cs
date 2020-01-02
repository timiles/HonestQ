using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpoClient;
using ExpoClient.Models;
using Pobs.MobileNotifications.Domain.Entities;

namespace Pobs.MobileNotifications.NotificationsApp
{
    internal class BatchSender
    {
        public async Task<IEnumerable<PushedNotification>> PushNotificationsAsync(IEnumerable<PushMessageModel<long>[]> batches)
        {
            var notificationSender = new NotificationSender();
            var pushedNotifications = new List<PushedNotification>();
            foreach (var batch in batches)
            {
                var sentAt = DateTimeOffset.UtcNow;
                var pushTickets = await notificationSender.SendAsync(batch);

                var pushTicketIndex = 0;
                foreach (var message in batch)
                {
                    for (var toIndex = 0; toIndex < message.To.Count; toIndex++)
                    {
                        var pushTicket = pushTickets[pushTicketIndex];
                        pushedNotifications.Add(
                            new PushedNotification
                            {
                                NotificationId = message.Ids[toIndex],
                                PushToken = message.To[toIndex],
                                SentAt = sentAt,
                                Status = pushTicket.Status.Truncate(50),
                                ExpoId = pushTicket.Id,
                                Message = pushTicket.Message.Truncate(1000),
                                Error = pushTicket.Details?.Error.Truncate(50),
                            });

                        pushTicketIndex++;
                    }
                }
            }

            return pushedNotifications;
        }
    }
}
