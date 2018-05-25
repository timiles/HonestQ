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
        Task<TopicsListModel> GetAll();
        Task<TopicModel> Get(string topicUrlFragment);
        Task SaveTopic(string urlFragment, string name, int postedByUserId);
        Task<StatementListItemModel> SaveStatement(string topicUrlFragment, string text, int postedByUserId);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task<TopicsListModel> GetAll()
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

        public async Task<TopicModel> Get(string topicUrlFragment)
        {
            var topic = await _context.Topics
                .Include(x => x.Statements)
                .FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            if (topic == null)
            {
                throw new EntityNotFoundException();
            }
            return new TopicModel
            {
                Name = topic.Name,
                Statements = topic.Statements.Select(x => new StatementListItemModel
                {
                    Text = x.Text
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

        public async Task<StatementListItemModel> SaveStatement(string topicUrlFragment, string text, int postedByUserId)
        {
            var topicTask = _context.Topics.FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var topic = await topicTask;
            if (topic == null)
            {
                throw new EntityNotFoundException();
            }
            topic.Statements.Add(new Statement(text, await postedByUserTask, DateTime.UtcNow));
            await _context.SaveChangesAsync();

            return new StatementListItemModel
            {
                Text = text
            };
        }
    }
}
