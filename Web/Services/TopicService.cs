using System;
using System.Threading.Tasks;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task Save(string urlFragment, string name, int postedByUserId);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task Save(string urlFragment, string name, int postedByUserId)
        {
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(new Topic(urlFragment, name, postedByUser, DateTime.UtcNow));
            await _context.SaveChangesAsync();
        }
    }
}