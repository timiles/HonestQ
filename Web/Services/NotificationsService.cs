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
        Task AddWatch(int loggedInUserId, WatchType type, long id);
        Task RemoveWatch(int loggedInUserId, WatchType type, long id);
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

        public async Task AddWatch(int loggedInUserId, WatchType type, long id)
        {
            var watch = new Watch(loggedInUserId);
            switch (type)
            {
                case WatchType.Answer:
                    {
                        watch.AnswerId = (int)id;
                        break;
                    }
                case WatchType.Comment:
                    {
                        watch.CommentId = id;
                        break;
                    }
                case WatchType.Question:
                    {
                        watch.QuestionId = (int)id;
                        break;
                    }
                case WatchType.Tag:
                    {
                        watch.TagId = (int)id;
                        break;
                    }
                default: throw new ArgumentOutOfRangeException($"Unknown WatchType: {type}.");
            }

            _context.Watches.Add(watch);
            try
            {
                await _context.SaveChangesAsync();
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

        public async Task RemoveWatch(int loggedInUserId, WatchType type, long id)
        {
            Watch watch;

            switch (type)
            {
                case WatchType.Answer:
                    {
                        watch = await _context.Watches.FirstOrDefaultAsync(x => x.UserId == loggedInUserId && x.AnswerId == id);
                        break;
                    }
                case WatchType.Comment:
                    {
                        watch = await _context.Watches.FirstOrDefaultAsync(x => x.UserId == loggedInUserId && x.CommentId == id);
                        break;
                    }
                case WatchType.Question:
                    {
                        watch = await _context.Watches.FirstOrDefaultAsync(x => x.UserId == loggedInUserId && x.QuestionId == id);
                        break;
                    }
                case WatchType.Tag:
                    {
                        watch = await _context.Watches.FirstOrDefaultAsync(x => x.UserId == loggedInUserId && x.TagId == id);
                        break;
                    }
                default: throw new ArgumentOutOfRangeException($"Unknown WatchType: {type}.");
            }

            if (watch == null)
            {
                throw new AppException("Watch does not exist.");
            }

            _context.Watches.Remove(watch);
            await _context.SaveChangesAsync();
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
