using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Models.Activity;

namespace Pobs.Web.Services
{
    public interface IActivityService
    {
        Task<ActivityListModel> ListActivity(int pageSize, long? beforeUnixTimeMilliseconds = null);
    }

    public class ActivityService : IActivityService
    {
        private static DateTime s_firstOfJanuary1970 = new DateTime(1970, 1, 1);
        private HonestQDbContext _context;

        public ActivityService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<ActivityListModel> ListActivity(int pageSize, long? beforeUnixTimeMilliseconds = null)
        {
            var beforeTime = beforeUnixTimeMilliseconds.HasValue ?
                s_firstOfJanuary1970.AddMilliseconds(beforeUnixTimeMilliseconds.Value) :
                DateTime.UtcNow;

            // TODO: This would be better loaded from a cache
            // NOTE: DbContext is not threadsafe to run multiple queries concurrently. Await each in turn.
            var questions = await _context.Questions
                .Include(x => x.Answers)
                .Include(x => x.QuestionTopics).ThenInclude(x => x.Topic)
                .Where(x => x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var answers = await _context.Questions
                .SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .Include(x => x.Comments)
                .Where(x => x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var comments = await _context.Questions
                .SelectMany(x => x.Answers)
                .SelectMany(x => x.Comments)
                .Include(x => x.Answer).ThenInclude(x => x.Question)
                .Where(x => x.Status == CommentStatus.OK && x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var questionsActivity = questions.Select(x => new ActivityListItemModel(x)).ToList();
            var answersActivity = answers.Select(x => new ActivityListItemModel(x)).ToList();
            var commentsActivity = comments.Select(x => new ActivityListItemModel(x)).ToList();

            var allActivity = questionsActivity.Concat(answersActivity).Concat(commentsActivity)
                .OrderByDescending(x => x.PostedAt).Take(pageSize).ToArray();
            return new ActivityListModel(allActivity);
        }
    }
}
