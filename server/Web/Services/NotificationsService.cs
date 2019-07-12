using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Notifications;

namespace Pobs.Web.Services
{
    public interface INotificationsService
    {
        Task<NotificationsListModel> ListNotifications(int loggedInUserId, int pageSize, long? beforeNotificationId);
        Task<NotificationsCountModel> CountNotifications(int loggedInUserId);
        Task<WatchResponseModel> AddWatchToTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> RemoveWatchFromTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> AddWatchToQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> RemoveWatchFromQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> RemoveWatchFromAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> AddWatchToComment(int loggedInUserId, int questionId, int answerId, long commentId);
        Task<WatchResponseModel> RemoveWatchFromComment(int loggedInUserId, int questionId, int answerId, long commentId);
        Task CreateNotificationsForQuestion(int questionId);
        Task CreateNotificationsForAnswer(int answerId);
        Task CreateNotificationsForComment(long commentId);
        Task<bool> MarkAsSeen(int loggedInUserId, long notificationId);
        Task MarkAllAsSeen(int loggedInUserId);
        Task AddPushToken(string token, int? loggedInUserId);
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

        public async Task<NotificationsCountModel> CountNotifications(int loggedInUserId)
        {
            var count = await _context.Notifications
                .CountAsync(x => x.OwnerUser.Id == loggedInUserId && x.Seen == false);
            return new NotificationsCountModel(count);
        }

        public async Task<WatchResponseModel> AddWatchToTag(int loggedInUserId, string tagSlug)
        {
            var tag = await _context.Tags.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Slug == tagSlug);
            if (tag == null)
            {
                return null;
            }
            tag.Watches.Add(new Watch(loggedInUserId));
            try
            {
                await _context.SaveChangesAsync();
                return new WatchResponseModel(tag, loggedInUserId);
            }
            catch (DbUpdateException e)
            {
                if (e.InnerException?.Message.StartsWith("Duplicate entry") == true)
                {
                    throw new AppException("Watch already exists.");
                }
                throw;
            }
        }

        public async Task<WatchResponseModel> RemoveWatchFromTag(int loggedInUserId, string tagSlug)
        {
            var tag = await _context.Tags.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Slug == tagSlug);
            if (tag == null)
            {
                return null;
            }
            var watch = tag.Watches.FirstOrDefault(x => x.UserId == loggedInUserId);
            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
            return new WatchResponseModel(tag, loggedInUserId);
        }

        public async Task<WatchResponseModel> AddWatchToQuestion(int loggedInUserId, int questionId)
        {
            var question = await _context.Questions.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null)
            {
                return null;
            }
            question.Watches.Add(new Watch(loggedInUserId));
            try
            {
                await _context.SaveChangesAsync();
                return new WatchResponseModel(question, loggedInUserId);
            }
            catch (DbUpdateException e)
            {
                if (e.InnerException?.Message.StartsWith("Duplicate entry") == true)
                {
                    throw new AppException("Watch already exists.");
                }
                throw;
            }
        }

        public async Task<WatchResponseModel> RemoveWatchFromQuestion(int loggedInUserId, int questionId)
        {
            var question = await _context.Questions.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null)
            {
                return null;
            }
            var watch = question.Watches.FirstOrDefault(x => x.UserId == loggedInUserId);
            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
            return new WatchResponseModel(question, loggedInUserId);
        }

        public async Task<WatchResponseModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId)
        {
            var answer = await _context.Questions.SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .Include(x => x.Watches)
                .FirstOrDefaultAsync(x => x.Id == answerId && x.Question.Id == questionId);
            if (answer == null)
            {
                return null;
            }
            answer.Watches.Add(new Watch(loggedInUserId));
            try
            {
                await _context.SaveChangesAsync();
                return new WatchResponseModel(answer, loggedInUserId);
            }
            catch (DbUpdateException e)
            {
                if (e.InnerException?.Message.StartsWith("Duplicate entry") == true)
                {
                    throw new AppException("Watch already exists.");
                }
                throw;
            }
        }

        public async Task<WatchResponseModel> RemoveWatchFromAnswer(int loggedInUserId, int questionId, int answerId)
        {
            var answer = await _context.Questions.SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .Include(x => x.Watches)
                .FirstOrDefaultAsync(x => x.Id == answerId && x.Question.Id == questionId);
            if (answer == null)
            {
                return null;
            }
            var watch = answer.Watches.FirstOrDefault(x => x.UserId == loggedInUserId);
            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
            return new WatchResponseModel(answer, loggedInUserId);
        }

        public async Task<WatchResponseModel> AddWatchToComment(int loggedInUserId, int questionId, int answerId, long commentId)
        {
            var comment = await _context.Questions.SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                .Include(x => x.Answer).ThenInclude(x => x.Question)
                .Include(x => x.Watches)
                .FirstOrDefaultAsync(x => x.Id == commentId && x.Answer.Id == answerId && x.Answer.Question.Id == questionId);
            if (comment == null)
            {
                return null;
            }
            comment.Watches.Add(new Watch(loggedInUserId));
            try
            {
                await _context.SaveChangesAsync();
                return new WatchResponseModel(comment, loggedInUserId);
            }
            catch (DbUpdateException e)
            {
                if (e.InnerException?.Message.StartsWith("Duplicate entry") == true)
                {
                    throw new AppException("Watch already exists.");
                }
                throw;
            }
        }

        public async Task<WatchResponseModel> RemoveWatchFromComment(int loggedInUserId, int questionId, int answerId, long commentId)
        {
            var comment = await _context.Questions.SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                .Include(x => x.Answer).ThenInclude(x => x.Question)
                .Include(x => x.Watches)
                .FirstOrDefaultAsync(x => x.Id == commentId && x.Answer.Id == answerId && x.Answer.Question.Id == questionId);
            if (comment == null)
            {
                return null;
            }
            var watch = comment.Watches.FirstOrDefault(x => x.UserId == loggedInUserId);
            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
            return new WatchResponseModel(comment, loggedInUserId);
        }

        public async Task CreateNotificationsForQuestion(int questionId)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForQuestion(@p0)", questionId);
        }
        public async Task CreateNotificationsForAnswer(int answerId)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForAnswer(@p0)", answerId);
        }
        public async Task CreateNotificationsForComment(long commentId)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForComment(@p0)", commentId);
        }

        public async Task<bool> MarkAsSeen(int loggedInUserId, long notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null || notification.OwnerUserId != loggedInUserId)
            {
                return false;
            }
            notification.Seen = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task MarkAllAsSeen(int loggedInUserId)
        {
            // REVIEW: Consider turning into a stored proc, rather than retrieving and updating all records
            var notifications = await _context.Notifications
                .Where(x => x.OwnerUserId == loggedInUserId && x.Seen == false).ToListAsync();
            foreach (var notification in notifications)
            {
                notification.Seen = true;
            }
            await _context.SaveChangesAsync();
        }

        public async Task AddPushToken(string token, int? loggedInUserId)
        {
            var existing = await _context.PushTokens.FindAsync(token);
            if (existing != null)
            {
                if (loggedInUserId.HasValue && existing.UserId != loggedInUserId.Value)
                {
                    existing.UserId = loggedInUserId.Value;
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                var pushToken = new PushToken(token)
                {
                    UserId = loggedInUserId,
                };
                await _context.PushTokens.AddAsync(pushToken);
                await _context.SaveChangesAsync();
            }
        }
    }
}
