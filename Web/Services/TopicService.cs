using System;
using System.Threading.Tasks;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task SaveTopic(string urlFragment, string name, int postedByUserId);
        Task SaveOpinion(int topicId, string text, int postedByUserId);
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

        public async Task SaveOpinion(int topicId, string text, int postedByUserId)
        {
            var topic = await _context.Topics.FindAsync(topicId);
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            topic.Opinions.Add(new Opinion(text, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }
    }
}
