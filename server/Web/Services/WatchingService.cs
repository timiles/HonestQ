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

        Task<WatchingQuestionsListModel> ListQuestions(int? loggedInUserId, int pageSize, long? beforeWatchId = null);
        Task<WatchingQuestionListItemModel> AddWatchToQuestion(int loggedInUserId, int questionId);
        Task<WatchResponseModel> RemoveWatchFromQuestion(int loggedInUserId, int questionId);

        Task<WatchingAnswersListModel> ListAnswers(int? loggedInUserId, int pageSize, long? beforeWatchId = null);
        Task<WatchingAnswerListItemModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId);
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

        public async Task<WatchingQuestionsListModel> ListQuestions(
            int? loggedInUserId, int pageSize, long? beforeWatchId = null)
        {
            var watches = await _context.Watches
                .Include(x => x.Question)
                .Where(x =>
                    x.UserId == loggedInUserId &&
                    (beforeWatchId == null || x.Id < beforeWatchId) &&
                    x.Question.Status == PostStatus.OK)
                .OrderByDescending(x => x.Id)
                .Take(pageSize)
                .ToListAsync();
            return new WatchingQuestionsListModel(watches);
        }

        public async Task<WatchingQuestionListItemModel> AddWatchToQuestion(int loggedInUserId, int questionId)
        {
            var question = await _context.Questions.FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null)
            {
                return null;
            }

            var watch = new Watch(loggedInUserId) { Question = question };

            try
            {
                _context.Watches.Add(watch);
                await _context.SaveChangesAsync();
                return new WatchingQuestionListItemModel(watch);
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


        public async Task<WatchingAnswersListModel> ListAnswers(
            int? loggedInUserId, int pageSize, long? beforeWatchId = null)
        {
            var watches = await _context.Watches
                .Include(x => x.Answer)
                .ThenInclude(x => x.Question)
                .Where(x =>
                    x.UserId == loggedInUserId &&
                    (beforeWatchId == null || x.Id < beforeWatchId) &&
                    x.Answer.Question.Status == PostStatus.OK)
                .OrderByDescending(x => x.Id)
                .Take(pageSize)
                .ToListAsync();
            return new WatchingAnswersListModel(watches);
        }

        public async Task<WatchingAnswerListItemModel> AddWatchToAnswer(int loggedInUserId, int questionId, int answerId)
        {
            var answer = await _context.Questions.SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .FirstOrDefaultAsync(x => x.Id == answerId && x.Question.Id == questionId);
            if (answer == null)
            {
                return null;
            }

            var watch = new Watch(loggedInUserId) { Answer = answer };

            try
            {
                _context.Watches.Add(watch);
                await _context.SaveChangesAsync();
                return new WatchingAnswerListItemModel(watch);
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
