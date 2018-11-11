using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Services
{
    public interface ITagService
    {
        Task<TagsListModel> GetAllTags(bool isApproved);
        Task SaveTag(string name, string description, string moreInfoUrl, int postedByUserId);
        Task<AdminTagModel> UpdateTag(string tagSlug, string newSlug, string name, string description, string moreInfoUrl, bool isApproved);
        Task<TagModel> GetTag(string tagSlug, bool isAdmin);
        Task<TagAutocompleteResultsModel> Query(string q);
    }

    public class TagService : ITagService
    {
        private HonestQDbContext _context;

        public TagService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<TagsListModel> GetAllTags(bool isApproved)
        {
            var tags = await _context.Tags.Where(x => x.IsApproved == isApproved).ToListAsync();
            return new TagsListModel(tags);
        }

        public async Task SaveTag(string name, string description, string moreInfoUrl, int postedByUserId)
        {
            var slug = name.ToSlug(true);
            var tagWithSameSlug = _context.Tags.FirstOrDefault(x => x.Slug == slug);
            if (tagWithSameSlug != null)
            {
                if (tagWithSameSlug.IsApproved)
                {
                    throw new AppException($"A tag already exists at /{slug}.");
                }
                // If it's not yet approved, no-one needs to know?
                return;
            }
            var postedByUser = await _context.Users.FindAsync(postedByUserId);
            _context.Tags.Add(
                new Tag(slug, name, postedByUser, DateTime.UtcNow)
                {
                    Description = description,
                    MoreInfoUrl = moreInfoUrl,
                    IsApproved = false
                });
            await _context.SaveChangesAsync();
        }

        public async Task<AdminTagModel> UpdateTag(string tagSlug, string newSlug, string name, string description, string moreInfoUrl, bool isApproved)
        {
            var tag = await _context.Tags.FirstOrDefaultAsync(x => x.Slug == tagSlug);
            if (tag == null)
            {
                return null;
            }

            if (tagSlug != newSlug)
            {
                var tagWithSameSlug = _context.Tags.FirstOrDefault(x => x.Id != tag.Id && x.Slug == newSlug);
                if (tagWithSameSlug != null)
                {
                    if (tagWithSameSlug.IsApproved)
                    {
                        throw new AppException($"A tag already exists at /{newSlug}.");
                    }
                    else
                    {
                        throw new AppException($"Unapproved TagId {tagWithSameSlug.Id} already has slug {newSlug}.");
                    }
                }
            }

            tag.Slug = newSlug;
            tag.Name = name;
            tag.Description = description;
            tag.MoreInfoUrl = moreInfoUrl;
            tag.IsApproved = isApproved;
            await _context.SaveChangesAsync();
            return new AdminTagModel(tag);
        }

        public async Task<TagModel> GetTag(string tagSlug, bool isAdmin)
        {
            var tag = await _context.Tags
                    // TODO: This could be more efficient if we aggregated Answer counts in SQL
                    .Include(x => x.QuestionTags).ThenInclude(x => x.Question).ThenInclude(x => x.Answers)
                    .Include(x => x.QuestionTags).ThenInclude(x => x.Question).ThenInclude(x => x.QuestionTags)
                    .Include(x => x.QuestionTags).ThenInclude(x => x.Question).ThenInclude(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .FirstOrDefaultAsync(x => x.Slug == tagSlug);
            if (tag == null || (!tag.IsApproved && !isAdmin))
            {
                return null;
            }
            var model = (isAdmin) ? new AdminTagModel(tag) : new TagModel(tag);
            return model;
        }

        public async Task<TagAutocompleteResultsModel> Query(string q)
        {
            var tags = await _context.Tags.Where(x => x.IsApproved && x.Name.ToLower().StartsWith(q)).ToArrayAsync();
            return new TagAutocompleteResultsModel(tags.ToArray());
        }
    }
}
