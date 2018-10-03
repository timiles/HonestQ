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
        Task<ActivityListModel> ListActivities(int pageSize);
    }

    public class ActivityService : IActivityService
    {
        private HonestQDbContext _context;

        public ActivityService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<ActivityListModel> ListActivities(int pageSize)
        {
            // TODO: This would be better loaded from a cache
            // NOTE: DbContext is not threadsafe to run multiple queries concurrently. Await each in turn.
            var questions = await _context.Questions
                .Include(x => x.Answers)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var answers = await _context.Questions
                .SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .Include(x => x.Comments)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var comments = await _context.Questions
                .SelectMany(x => x.Answers)
                .SelectMany(x => x.Comments)
                .Include(x => x.Answer).ThenInclude(x => x.Question)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();

            var questionsActivity = questions.Select(x => new ActivityModel(x)).ToList();
            var answersActivity = answers.Select(x => new ActivityModel(x)).ToList();
            var commentsActivity = comments.Select(x => new ActivityModel(x)).ToList();

            var allActivity = questionsActivity.Concat(answersActivity).Concat(commentsActivity)
                .OrderByDescending(x => x.PostedAt).Take(pageSize).ToArray();
            return new ActivityListModel(allActivity);
        }
    }
}
