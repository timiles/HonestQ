using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task SaveTopic(string urlFragment, string name, int postedByUserId);
        Task SaveOpinion(string topicUrlFragment, string text, int postedByUserId);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task SaveTopic(string urlFragment, string name, int postedByUserId)
        {
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(new Topic(urlFragment, name, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }

        public async Task SaveOpinion(string topicUrlFragment, string text, int postedByUserId)
        {
            var topicTask = _context.Topics.FirstOrDefaultAsync(x => x.UrlFragment == topicUrlFragment);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var topic = await topicTask;
            if (topic == null)
            {
                throw new EntityNotFoundException();
            }
            topic.Opinions.Add(new Opinion(text, await postedByUserTask, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }
    }
}
