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
        Task SaveTopic(string urlFragment, string name, int postedByUserId);
        Task<TopicModel> GetTopic(string topicUrlFragment);
        Task<StatementListItemModel> SaveStatement(string topicUrlFragment, string text, int postedByUserId);
        Task<StatementModel> GetStatement(string topicUrlFragment, int statementId);
        Task<CommentListItemModel> SaveComment(string topicUrlFragment, int statementId, string text, int postedByUserId);
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
            return new TopicsListModel
            {
                Topics = topics.Select(x => new TopicsListModel.TopicListItemModel
                {
                    UrlFragment = x.UrlFragment,
                    Name = x.Name
                }).ToArray()
            };
        }

        public async Task SaveTopic(string urlFragment, string name, int postedByUserId)
        {
            if (_context.Topics.Any(x => x.UrlFragment == urlFragment))
            {
                throw new AppException($"A topic already exists at /{urlFragment}");
            }
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(new Topic(urlFragment, name, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }

        public async Task<TopicModel> GetTopic(string topicUrlFragment)
        {
            var topic = await _context.Topics
                .Include(x => x.Statements)
                .FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            if (topic == null)
            {
                return null;
            }
            return new TopicModel
            {
                Name = topic.Name,
                Statements = topic.Statements.Select(x => new StatementListItemModel
                {
                    Id = x.Id,
                    Text = x.Text
                }).ToArray()
            };
        }

        public async Task<StatementListItemModel> SaveStatement(string topicUrlFragment, string text, int postedByUserId)
        {
            var topicTask = _context.Topics.FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var topic = await topicTask;
            if (topic == null)
            {
                return null;
            }
            topic.Statements.Add(new Statement(text, await postedByUserTask, DateTime.UtcNow));
            await _context.SaveChangesAsync();

            return new StatementListItemModel
            {
                Text = text
            };
        }

        public async Task<StatementModel> GetStatement(string topicUrlFragment, int statementId)
        {
            var statement = await _context.Topics
                .SelectMany(x => x.Statements)
                .FirstOrDefaultAsync(x => x.Topic.UrlFragment == topicUrlFragment && x.Id == statementId);
            if (statement == null)
            {
                return null;
            }
            return new StatementModel
            {
                Text = statement.Text
            };
        }

        public async Task<CommentListItemModel> SaveComment(string topicUrlFragment, int statementId, string text, int postedByUserId)
        {
            var statementTask = _context.Topics
                .SelectMany(x => x.Statements)
                .Include(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Topic.UrlFragment == topicUrlFragment && x.Id == statementId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var statement = await statementTask;
            if (statement == null)
            {
                return null;
            }
            var postedAt = DateTime.UtcNow;
            var postedByUser = await postedByUserTask;
            statement.Comments.Add(new Comment(text, postedByUser, postedAt));
            await _context.SaveChangesAsync();

            return new CommentListItemModel
            {
                Text = text,
                PostedAt = postedAt,
                PostedByUsername = postedByUser.Username
            };
        }
    }
}
