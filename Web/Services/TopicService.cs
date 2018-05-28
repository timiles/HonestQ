using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task<TopicsListModel> GetAllTopics();
        Task SaveTopic(string slug, string name, int postedByUserId);
        Task<TopicModel> GetTopic(string topicSlug);
        Task<StatementListItemModel> SaveStatement(string topicSlug, string text, int postedByUserId);
        Task<StatementModel> GetStatement(string topicSlug, int statementId);
        Task<CommentListItemModel> SaveComment(string topicSlug, int statementId, string text, int postedByUserId);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task<TopicsListModel> GetAllTopics()
        {
            var topics = await _context.Topics.ToListAsync();
            return new TopicsListModel(topics);
        }

        public async Task SaveTopic(string slug, string name, int postedByUserId)
        {
            if (_context.Topics.Any(x => x.Slug == slug))
            {
                throw new AppException($"A topic already exists at /{slug}");
            }
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(new Topic(slug, name, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }

        public async Task<TopicModel> GetTopic(string topicSlug)
        {
            var topic = await _context.Topics
                .Include(x => x.Statements)
                .FirstOrDefaultAsync(x => x.Slug == topicSlug);
            if (topic == null)
            {
                return null;
            }
            return new TopicModel(topic);
        }

        public async Task<StatementListItemModel> SaveStatement(string topicSlug, string text, int postedByUserId)
        {
            var topicTask = _context.Topics.FirstOrDefaultAsync(x => x.Slug == topicSlug);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var topic = await topicTask;
            if (topic == null)
            {
                return null;
            }
            var statement = new Statement(text, await postedByUserTask, DateTime.UtcNow);
            topic.Statements.Add(statement);
            await _context.SaveChangesAsync();

            return new StatementListItemModel(statement);
        }

        public async Task<StatementModel> GetStatement(string topicSlug, int statementId)
        {
            var statement = await _context.Topics
                .SelectMany(x => x.Statements)
                .Include(x => x.Comments)
                .Include(x => x.PostedByUser)
                .FirstOrDefaultAsync(x => x.Topic.Slug == topicSlug && x.Id == statementId);
            if (statement == null)
            {
                return null;
            }
            return new StatementModel(statement);
        }

        public async Task<CommentListItemModel> SaveComment(string topicSlug, int statementId, string text, int postedByUserId)
        {
            var statementTask = _context.Topics
                .SelectMany(x => x.Statements)
                .Include(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Topic.Slug == topicSlug && x.Id == statementId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var statement = await statementTask;
            if (statement == null)
            {
                return null;
            }
            var comment = new Comment(text, await postedByUserTask, DateTime.UtcNow);
            statement.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentListItemModel(comment);
        }
    }
}
