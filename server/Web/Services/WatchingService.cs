using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Watching;

namespace Pobs.Web.Services
{
    public interface IWatchingService
    {
        Task<WatchResponseModel> AddWatchToTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> RemoveWatchFromTag(int loggedInUserId, string tagSlug);
        Task<WatchResponseModel> AddWatchToQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> RemoveWatchFromQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> RemoveWatchFromAnswer(int loggedInUserId, int questionId, int answerId);
        Task<WatchResponseModel> AddWatchToComment(int loggedInUserId, int questionId, int answerId, long commentId);
        Task<WatchResponseModel> RemoveWatchFromComment(int loggedInUserId, int questionId, int answerId, long commentId);
    }

    public class WatchingService : IWatchingService
    {
        private HonestQDbContext _context;

        public WatchingService(HonestQDbContext context)
        {
            _context = context;
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
    }
}
