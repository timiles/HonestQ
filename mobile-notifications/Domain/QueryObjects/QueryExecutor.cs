using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Pobs.MobileNotifications.Domain.QueryObjects
{
    public class QueryExecutor
    {
        private readonly string _webConnectionString;

        public QueryExecutor(string webConnectionString)
        {
            this._webConnectionString = webConnectionString;
        }

        public async Task<QuestionNotificationToPush[]> GetQuestionNotificationsToPushAsync(long sinceNotificationId)
        {
            using (var dbContext = new HonestQDbContext(this._webConnectionString))
            {
                return await dbContext.QuestionNotificationsToPush
                    .FromSql("CALL GetQuestionNotificationsToPush(@p0)", sinceNotificationId)
                    .ToArrayAsync();
            }
        }

        public async Task<AnswerNotificationToPush[]> GetAnswerNotificationsToPushAsync(long sinceNotificationId)
        {
            using (var dbContext = new HonestQDbContext(this._webConnectionString))
            {
                return await dbContext.AnswerNotificationsToPush
                    .FromSql("CALL GetAnswerNotificationsToPush(@p0)", sinceNotificationId)
                    .ToArrayAsync();
            }
        }

        public async Task<CommentNotificationToPush[]> GetCommentNotificationsToPushAsync(long sinceNotificationId)
        {
            using (var dbContext = new HonestQDbContext(this._webConnectionString))
            {
                return await dbContext.CommentNotificationsToPush
                    .FromSql("CALL GetCommentNotificationsToPush(@p0)", sinceNotificationId)
                    .ToArrayAsync();
            }
        }
    }
}
