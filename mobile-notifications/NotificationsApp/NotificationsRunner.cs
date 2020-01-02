using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.MobileNotifications.Domain;
using Pobs.MobileNotifications.Domain.Entities;
using Pobs.NotificationsApp.Batching;

namespace Pobs.MobileNotifications.NotificationsApp
{
    public class NotificationsRunner
    {
        private string _webConnectionString;
        private string _notificationsConnectionString;
        private Action<string> _log;

        public NotificationsRunner(string webConnectionString, string notificationsConnectionString, Action<string> logLine)
        {
            this._webConnectionString = webConnectionString;
            this._notificationsConnectionString = notificationsConnectionString;
            this._log = logLine;
        }

        public async Task RunAsync()
        {
            using (var dbContext = new MigrationDbContext(this._notificationsConnectionString))
            {
                dbContext.Database.Migrate();
            }

            foreach (var runType in new[] { RunType.Question, RunType.Answer, RunType.Comment })
            {
                try
                {
                    await RunAsync(runType);
                }
                catch (Exception e)
                {
                    this._log($"RunType: {runType}, Exception: {e}");
                }
            }
        }

        private async Task RunAsync(RunType runType)
        {
            var currentRun = new Run
            {
                Type = runType,
                StartedAt = DateTimeOffset.UtcNow,
            };
            long lastMaxNotificationId = 0;

            using (var mobileNotificationsDbContext = new MobileNotificationsDbContext(this._notificationsConnectionString))
            {
                lastMaxNotificationId = await mobileNotificationsDbContext.Runs
                    .Include(x => x.PushedNotifications)
                    .Where(x => x.Type == runType)
                    .SelectMany(x => x.PushedNotifications)
                    .MaxAsync(x => x.NotificationId);

                mobileNotificationsDbContext.Runs.Add(currentRun);
                await mobileNotificationsDbContext.SaveChangesAsync();
            }

            var notificationsBatcherFactory = new NotificationsBatcherFactory();
            var notificationsBatcher = notificationsBatcherFactory.CreateNotificationsBatcher(runType, this._webConnectionString);
            var batchedNotifications = await notificationsBatcher.CreateBatchesAsync(lastMaxNotificationId);
            if (batchedNotifications?.Any() == true)
            {
                var batchSender = new BatchSender();
                var pushedNotifications = await batchSender.PushNotificationsAsync(batchedNotifications);
                foreach (var pushedNotification in pushedNotifications)
                {
                    currentRun.PushedNotifications.Add(pushedNotification);
                }
            }

            using (var mobileNotificationsDbContext = new MobileNotificationsDbContext(this._notificationsConnectionString))
            {
                mobileNotificationsDbContext.Attach(currentRun);
                currentRun.FinishedAt = DateTimeOffset.UtcNow;
                await mobileNotificationsDbContext.SaveChangesAsync();
            }
        }
    }
}
