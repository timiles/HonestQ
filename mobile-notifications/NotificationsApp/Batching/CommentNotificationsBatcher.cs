using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpoClient;
using ExpoClient.Models;
using Pobs.MobileNotifications.Domain;
using Pobs.MobileNotifications.Domain.QueryObjects;

namespace Pobs.NotificationsApp.Batching
{
    internal class CommentNotificationsBatcher : INotificationsBatcher
    {
        private readonly string _webConnectionString;

        public CommentNotificationsBatcher(string webConnectionString)
        {
            this._webConnectionString = webConnectionString;
        }

        public async Task<IEnumerable<PushMessageModel<long>[]>> CreateBatchesAsync(long sinceNotificationId)
        {
            var queryExecutor = new QueryExecutor(this._webConnectionString);
            var notifications = await queryExecutor.GetCommentNotificationsToPushAsync(sinceNotificationId);

            if (!notifications.Any())
            {
                return null;
            }

            var messageBatcher = new PushMessageBatcher<long>();
            foreach (var notification in notifications)
            {
                var title = $"New comment on {notification.AnswerText}";
                var body = notification.CommentText;
                var data = new { routeName = "Answer", @params = new { questionId = notification.QuestionId, answerId = notification.AnswerId } };
                messageBatcher.Add(notification.NotificationId, notification.PushToken, title, body, data);
            }
            return messageBatcher.GetBatches();
        }
    }
}