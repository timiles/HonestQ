using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Pobs.Domain.QueryObjects
{
    public class QueryExecutor
    {
        private readonly HonestQDbContext _dbContext;

        public QueryExecutor(HonestQDbContext dbContext)
        {
            this._dbContext = dbContext;
        }

        public async Task<QuestionNotificationToPush[]> GetQuestionNotificationsToPushAsync(long sinceNotificationId)
        {
            return await _dbContext.QuestionNotificationsToPush
                .FromSql("CALL GetQuestionNotificationsToPush(@p0)", sinceNotificationId)
                .ToArrayAsync();
        }
    }
}