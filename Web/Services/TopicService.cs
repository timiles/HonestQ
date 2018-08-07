using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Topics;

namespace Pobs.Web.Services
{
    public interface ITopicService
    {
        Task<TopicsListModel> GetAllTopics(bool isApproved);
        Task SaveTopic(string name, string summary, string moreInfoUrl, int postedByUserId);
        Task<AdminTopicModel> UpdateTopic(string topicSlug, string newSlug, string name, string summary, string moreInfoUrl, bool isApproved);
        Task<TopicModel> GetTopic(string topicSlug, bool isAdmin);
    }

    public class TopicService : ITopicService
    {
        private PobsDbContext _context;

        public TopicService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task<TopicsListModel> GetAllTopics(bool isApproved)
        {
            var topics = await _context.Topics.Where(x => x.IsApproved == isApproved).ToListAsync();
            return new TopicsListModel(topics);
        }

        public async Task SaveTopic(string name, string summary, string moreInfoUrl, int postedByUserId)
        {
            var slug = name.ToSlug(true);
            var topicWithSameSlug = _context.Topics.FirstOrDefault(x => x.Slug == slug);
            if (topicWithSameSlug != null)
            {
                if (topicWithSameSlug.IsApproved)
                {
                    throw new AppException($"A topic already exists at /{slug}");
                }
                // If it's not yet approved, no-one needs to know?
                return;
            }
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Topics.Add(
                new Topic(slug, name, postedByUser, DateTime.UtcNow)
                {
                    Summary = summary,
                    MoreInfoUrl = moreInfoUrl,
                    IsApproved = false
                });
            await _context.SaveChangesAsync();
        }

        public async Task<AdminTopicModel> UpdateTopic(string topicSlug, string newSlug, string name, string summary, string moreInfoUrl, bool isApproved)
        {
            var topic = await _context.Topics.FirstOrDefaultAsync(x => x.Slug == topicSlug);
            if (topic == null)
            {
                return null;
            }

            if (topicSlug != newSlug)
            {
                var topicWithSameSlug = _context.Topics.FirstOrDefault(x => x.Id != topic.Id && x.Slug == newSlug);
                if (topicWithSameSlug != null)
                {
                    if (topicWithSameSlug.IsApproved)
                    {
                        throw new AppException($"A topic already exists at /{newSlug}");
                    }
                    else
                    {
                        throw new AppException($"Unapproved TopicId {topicWithSameSlug.Id} already has slug {newSlug}");
                    }
                }
            }

            topic.Slug = newSlug;
            topic.Name = name;
            topic.Summary = summary;
            topic.MoreInfoUrl = moreInfoUrl;
            topic.IsApproved = isApproved;
            await _context.SaveChangesAsync();
            return new AdminTopicModel(topic);
        }

        public async Task<TopicModel> GetTopic(string topicSlug, bool isAdmin)
        {
            var topic = await _context.Topics
                    // TODO: This could be more efficient if we aggregated Comment AgreementRating data in SQL
                    .Include(x => x.StatementTopics).ThenInclude(x => x.Statement).ThenInclude(x => x.Comments)
                    .Include(x => x.StatementTopics).ThenInclude(x => x.Statement).ThenInclude(x => x.StatementTopics)
                    .Include(x => x.StatementTopics).ThenInclude(x => x.Statement).ThenInclude(x => x.StatementTopics).ThenInclude(x => x.Topic)
                .FirstOrDefaultAsync(x => x.Slug == topicSlug);
            if (topic == null || (!topic.IsApproved && !isAdmin))
            {
                return null;
            }
            var model = (isAdmin) ? new AdminTopicModel(topic) : new TopicModel(topic);
            return model;
        }
    }
}
