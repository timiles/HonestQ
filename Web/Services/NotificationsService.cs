using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Notifications;

namespace Pobs.Web.Services
{
    public interface INotificationsService
    {
        Task<NotificationsListModel> ListNotifications(int loggedInUserId, int pageSize, long? beforeNotificationId);
        Task<WatchResponseModel> AddWatch(int loggedInUserId, WatchType type, long id);
        Task<WatchResponseModel> RemoveWatch(int loggedInUserId, WatchType type, long id);
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

        private async Task<IHasWatches> GetWatchable(WatchType type, long id)
        {
            switch (type)
            {
                case WatchType.Answer:
                    return await _context.Questions.SelectMany(x => x.Answers)
                        .Include(x => x.Question)
                        .Include(x => x.Watches)
                        .FirstOrDefaultAsync(x => x.Id == (int)id);
                case WatchType.Comment:
                    return await _context.Questions.SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                        .Include(x => x.Answer).ThenInclude(x => x.Question)
                        .Include(x => x.Watches)
                        .FirstOrDefaultAsync(x => x.Id == id);
                case WatchType.Question:
                    return await _context.Questions.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Id == (int)id);
                case WatchType.Tag:
                    return await _context.Tags.Include(x => x.Watches).FirstOrDefaultAsync(x => x.Id == (int)id);
                default: throw new ArgumentOutOfRangeException($"Unknown WatchType: {type}.");
            }
        }

        private static WatchResponseModel BuildWatchResponseModel(WatchType type, IHasWatches watchable, int loggedInUserId)
        {
            switch (type)
            {
                case WatchType.Answer:
                    return new WatchResponseModel((Answer)watchable, loggedInUserId);
                case WatchType.Comment:
                    return new WatchResponseModel((Comment)watchable, loggedInUserId);
                case WatchType.Question:
                    return new WatchResponseModel((Question)watchable, loggedInUserId);
                case WatchType.Tag:
                    return new WatchResponseModel((Tag)watchable, loggedInUserId);
                default: throw new ArgumentOutOfRangeException($"Unknown WatchType: {type}.");
            }
        }

        public async Task<WatchResponseModel> AddWatch(int loggedInUserId, WatchType type, long id)
        {
            var watchable = await GetWatchable(type, id);
            if (watchable == null)
            {
                throw new AppException("Watchable entity not found.");
            }
            watchable.Watches.Add(new Watch(loggedInUserId));
            try
            {
                await _context.SaveChangesAsync();
                return BuildWatchResponseModel(type, watchable, loggedInUserId);
            }
            catch (DbUpdateException e)
            {
                if (e.InnerException?.Message.StartsWith("Duplicate entry") == true)
                {
                    throw new AppException("Watch already exists.");
                }
                if (e.InnerException?.Message.StartsWith("Cannot add or update a child row: a foreign key constraint fails") == true)
                {
                    throw new AppException("Watchable entity not found.");
                }
                throw;
            }
        }

        public async Task<WatchResponseModel> RemoveWatch(int loggedInUserId, WatchType type, long id)
        {
            var watchable = await GetWatchable(type, id);
            if (watchable == null)
            {
                throw new AppException("Watchable entity not found.");
            }
            var watch = watchable.Watches.FirstOrDefault(x => x.UserId == loggedInUserId);
            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
            return BuildWatchResponseModel(type, watchable, loggedInUserId);
        }

        public async Task CreateNotifications(Question question)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForQuestion(@p0)", question.Id);
        }
        public async Task CreateNotifications(Answer answer)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForAnswer(@p0)", answer.Id);
        }
        public async Task CreateNotifications(Comment comment)
        {
            await _context.Database.ExecuteSqlCommandAsync("CALL CreateNotificationsForComment(@p0)", comment.Id);
        }
    }
}
