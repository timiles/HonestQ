using System;
using Pobs.MobileNotifications.Domain.Entities;

namespace Pobs.NotificationsApp.Batching
{
    internal class NotificationsBatcherFactory
    {
        public INotificationsBatcher CreateNotificationsBatcher(RunType runType, string webConnectionString)
        {
            switch (runType)
            {
                case RunType.Question: return new QuestionNotificationsBatcher(webConnectionString);
                case RunType.Answer: return new AnswerNotificationsBatcher(webConnectionString);
                case RunType.Comment: return new CommentNotificationsBatcher(webConnectionString);
                default: throw new NotImplementedException();
            }
        }
    }
}