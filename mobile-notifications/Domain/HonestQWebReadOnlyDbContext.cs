using Microsoft.EntityFrameworkCore;
using Pobs.MobileNotifications.Domain.QueryObjects;

namespace Pobs.MobileNotifications.Domain
{
    public class HonestQDbContext : DbContext
    {
        public HonestQDbContext(string connectionString) : base(DefaultDbContextOptionsBuilder.Build(connectionString))
        {
        }

        public DbQuery<QuestionNotificationToPush> QuestionNotificationsToPush { get; set; }
        public DbQuery<AnswerNotificationToPush> AnswerNotificationsToPush { get; set; }
        public DbQuery<CommentNotificationToPush> CommentNotificationsToPush { get; set; }
    }
}
