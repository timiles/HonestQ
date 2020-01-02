using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpoClient;
using ExpoClient.Models;
using Pobs.MobileNotifications.Domain;
using Pobs.MobileNotifications.Domain.QueryObjects;

namespace Pobs.NotificationsApp.Batching
{
    internal class QuestionNotificationsBatcher : INotificationsBatcher
    {
        private readonly string _webConnectionString;

        public QuestionNotificationsBatcher(string webConnectionString)
        {
            this._webConnectionString = webConnectionString;
        }

        public async Task<IEnumerable<PushMessageModel<long>[]>> CreateBatchesAsync(long sinceNotificationId)
        {
            var queryExecutor = new QueryExecutor(this._webConnectionString);
            var notifications = await queryExecutor.GetQuestionNotificationsToPushAsync(sinceNotificationId);

            if (!notifications.Any())
            {
                return null;
            }

            var messageBatcher = new PushMessageBatcher<long>();
            foreach (var notification in notifications)
            {
                var tags = notification.TagNames.Split('|');
                var title = $"New question tagged {string.Join(", ", tags)}";
                var body = notification.QuestionText;
                var data = new { routeName = "Question", @params = new { questionId = notification.QuestionId } };
                messageBatcher.Add(notification.NotificationId, notification.PushToken, title, body, data);
            }
            return messageBatcher.GetBatches();
        }
    }
}