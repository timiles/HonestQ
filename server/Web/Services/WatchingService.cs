using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Web.Models.Questions;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Services
{
    public interface IWatchingService
    {
        Task<TagsListModel> GetTags(int loggedInUserId);
        Task<QuestionsListModel> GetQuestions(int loggedInUserId);
        Task<AnswersListModel> GetAnswers(int loggedInUserId);
    }

    public class WatchingService : IWatchingService
    {
        private HonestQDbContext _context;

        public WatchingService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<TagsListModel> GetTags(int loggedInUserId)
        {
            var tags = await _context.Tags.Where(x => x.Watches.Any(y => y.UserId == loggedInUserId)).ToListAsync();
            return new TagsListModel(tags);
        }

        public async Task<QuestionsListModel> GetQuestions(int loggedInUserId)
        {
            var questions = await _context.Questions.Where(x => x.Watches.Any(y => y.UserId == loggedInUserId)).ToListAsync();
            return new QuestionsListModel(questions);
        }

        public async Task<AnswersListModel> GetAnswers(int loggedInUserId)
        {
            var answers = await _context.Questions
                .SelectMany(x => x.Answers)
                .Where(x => x.Watches.Any(y => y.UserId == loggedInUserId)).ToListAsync();
            return new AnswersListModel(answers);
        }
    }
}
