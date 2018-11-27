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
        Task<WatchResponseModel> AddWatchToTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> RemoveWatchFromTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> AddWatchToQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> RemoveWatchFromQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> RemoveWatchFromAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> AddWatchToComment(int loggedInUserId, int questionId, int answerId, long commentId);
        Task<WatchResponseModel> RemoveWatchFromComment(int loggedInUserId, int questionId, int answerId, long commentId);
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