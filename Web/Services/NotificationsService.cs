using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Web.Models.Notifications;

namespace Pobs.Web.Services
{
    public interface INotificationsService
    {
        Task<NotificationsListModel> ListNotifications(int loggedInUserId, int pageSize, long? beforeNotificationId);
    }

    public class NotificationsService : INotificationsService
    {
        private HonestQDbContext _context;

        public NotificationsService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationsListModel> ListNotifications(int loggedInUserId, int pageSize, long? beforeNotificationId)
        {
            // TODO: This would be better loaded from a cache
            // NOTE: DbContext is not threadsafe to run multiple queries concurrently. Await each in turn.
            var notifications = await _context.Notifications
                .Where(x => x.OwnerUser.Id == loggedInUserId)
                .Include(x => x.Question).ThenInclude(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Include(x => x.Answer).ThenInclude(x => x.Question)
                .Include(x => x.Comment).ThenInclude(x => x.Answer).ThenInclude(x => x.Question)
                .Where(x => beforeNotificationId == null || x.Id < beforeNotificationId)
                .OrderByDescending(x => x.Id)
                .Take(pageSize)
                .ToListAsync();

            return new NotificationsListModel(notifications.ToArray());
        }
    }
}
