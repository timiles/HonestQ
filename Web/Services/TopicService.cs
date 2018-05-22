using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Controllers;
using Pobs.Web.Helpers;
using static Pobs.Web.Controllers.TopicsController;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task<GetTopicsListModel> GetAll();
        Task<GetTopicModel> Get(string topicUrlFragment);
        Task SaveTopic(string urlFragment, string name, int postedByUserId);
        Task SaveStatement(string topicUrlFragment, string text, int postedByUserId);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task<GetTopicsListModel> GetAll()
        {
            var topics = await _context.Topics.ToListAsync();
            return new GetTopicsListModel
            {
                Topics = topics.Select(x => new GetTopicsListModel.TopicListItemModel
                {
                    UrlFragment = x.UrlFragment,
                    Name = x.Name
                }).ToArray()
            };
        }

        public async Task<GetTopicModel> Get(string topicUrlFragment)
        {
            var topic = await _context.Topics
                .Include(x => x.Statements)
                .FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            if (topic == null)
            {
                throw new EntityNotFoundException();
            }
            return new GetTopicModel
            {
                Name = topic.Name,
                Statements = topic.Statements.Select(x => new GetTopicModel.StatementModel
                {
                    Text = x.Text
                }).ToArray()
            };
        }

        public async Task SaveTopic(string urlFragment, string name, int postedByUserId)
        {
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(new Topic(urlFragment, name, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }

        public async Task SaveStatement(string topicUrlFragment, string text, int postedByUserId)
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
        }
    }
}
