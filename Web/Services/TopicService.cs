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
        Task<StatementListItemModel> SaveStatement(string topicSlug, string text, string source, Stance stance, int postedByUserId);
        Task<StatementModel> GetStatement(string topicSlug, int statementId);
        Task<CommentListItemModel> SaveComment(string topicSlug, int statementId,
            string text, string source, AgreementRating agreementRating, int postedByUserId);
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
                .Include(x => x.Statements)
                    // TODO: This could be more efficient if we aggregated Comment AgreementRating data in SQL
                    .ThenInclude(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Slug == topicSlug);
            if (topic == null || (!topic.IsApproved && !isAdmin))
            {
                return null;
            }
            var model = (isAdmin) ? new AdminTopicModel(topic) : new TopicModel(topic);
            return model;
        }

        public async Task<StatementListItemModel> SaveStatement(string topicSlug, string text, string source, Stance stance, int postedByUserId)
        {
            var topicTask = _context.Topics.FirstOrDefaultAsync(x => x.Slug == topicSlug);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var topic = await topicTask;
            if (topic == null)
            {
                return null;
            }
            var statement = new Statement(text, await postedByUserTask, DateTime.UtcNow)
            {
                Source = source,
                Stance = stance,
            };
            topic.Statements.Add(statement);
            await _context.SaveChangesAsync();

            return new StatementListItemModel(statement);
        }

        public async Task<StatementModel> GetStatement(string topicSlug, int statementId)
        {
            var statement = await _context.Topics
                .SelectMany(x => x.Statements)
                .Include(x => x.Comments)
                .ThenInclude(x => x.PostedByUser)
                .FirstOrDefaultAsync(x => x.Topic.Slug == topicSlug && x.Id == statementId);
            if (statement == null)
            {
                return null;
            }
            return new StatementModel(statement);
        }

        public async Task<CommentListItemModel> SaveComment(string topicSlug, int statementId,
            string text, string source, AgreementRating agreementRating, int postedByUserId)
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
            var comment = new Comment(text, agreementRating, await postedByUserTask, DateTime.UtcNow)
            {
                Source = source
            };
            statement.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentListItemModel(comment);
        }
    }
}
