using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Pops;

namespace Pobs.Web.Services
{
    public interface IPopService
    {
        Task<PopListItemModel> SavePop(ValidatedPopModel model, int postedByUserId);
        Task<PopListItemModel> UpdatePop(int popId, ValidatedPopModel model);
        Task<PopsListModel> ListPops(PopType? popType);
        Task<PopModel> GetPop(int popId, int? loggedInUserId);
        Task<CommentModel> SaveComment(int popId, string text, string source, int postedByUserId, AgreementRating? agreementRating, long? parentCommentId);
        Task<CommentModel> GetComment(int popId, long commentId, int? loggedInUserId);
    }

    public class PopService : IPopService
    {
        private OmnipopsDbContext _context;

        public PopService(OmnipopsDbContext context)
        {
            _context = context;
        }

        public async Task<PopListItemModel> SavePop(ValidatedPopModel model, int postedByUserId)
        {
            var topicTasks = new List<Task<Topic>>();
            if (model.Topics != null)
            {
                foreach (var slug in model.Topics.Keys)
                {
                    topicTasks.Add(_context.Topics.FirstOrDefaultAsync(x => x.Slug == slug));
                }
            }

            var postedByUserTask = _context.Users.FindAsync(postedByUserId);

            var pop = new Pop(model.Text, await postedByUserTask, DateTime.UtcNow, model.Type)
            {
                Source = model.Source,
            };

            await Task.WhenAll(topicTasks);
            foreach (var topicTask in topicTasks)
            {
                var topic = topicTask.Result;
                if (topic != null)
                {
                    pop.AddTopic(topic, model.Topics[topic.Slug]);
                }
            }

            _context.Pops.Add(pop);
            await _context.SaveChangesAsync();

            return new PopListItemModel(pop);
        }

        public async Task<PopListItemModel> UpdatePop(int popId, ValidatedPopModel model)
        {
            var topicTasks = new List<Task<Topic>>();
            if (model.Topics != null)
            {
                foreach (var slug in model.Topics.Keys)
                {
                    topicTasks.Add(_context.Topics.FirstOrDefaultAsync(x => x.Slug == slug));
                }
            }

            var pop = await _context.Pops
                .Include(x => x.Comments)
                .Include(x => x.PopTopics)
                .FirstOrDefaultAsync(x => x.Id == popId);
            if (pop == null)
            {
                return null;
            }

            pop.Text = model.Text;
            pop.Slug = model.Text.ToSlug();
            pop.Source = model.Source;
            pop.Type = model.Type;
            pop.Topics.Clear();

            await Task.WhenAll(topicTasks);
            foreach (var topicTask in topicTasks)
            {
                var topic = topicTask.Result;
                if (topic != null)
                {
                    pop.AddTopic(topic, model.Topics[topic.Slug]);
                }
            }

            await _context.SaveChangesAsync();
            return new PopListItemModel(pop);
        }

        public async Task<PopsListModel> ListPops(PopType? popType)
        {
            var pops = await _context.Pops
                .Where(x => popType == null || x.Type == popType.Value)
                .ToListAsync();
            return new PopsListModel(pops);
        }

        public async Task<PopModel> GetPop(int popId, int? loggedInUserId)
        {
            var pop = await _context.Pops
                .Include(x => x.PopTopics).ThenInclude(x => x.Topic)
                .Include(x => x.Comments).ThenInclude(x => x.ChildComments)
                .FirstOrDefaultAsync(x => x.Id == popId);
            if (pop == null)
            {
                return null;
            }
            return new PopModel(pop, loggedInUserId);
        }

        public async Task<CommentModel> SaveComment(int popId,
            string text, string source, int postedByUserId, AgreementRating? agreementRating, long? parentCommentId)
        {
            var popTask = _context.Pops
                .Include(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Id == popId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var pop = await popTask;
            if (pop == null)
            {
                return null;
            }

            // Validate params
            if (agreementRating.HasValue && pop.Type == PopType.RequestForProof)
            {
                throw new AppException($"AgreementRating is invalid when Type is {pop.Type}");
            }

            var comment = new Comment(text, await postedByUserTask, DateTime.UtcNow, agreementRating, parentCommentId);

            comment.Source = source;
            pop.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentModel(comment, postedByUserId);
        }

        public async Task<CommentModel> GetComment(int popId, long commentId, int? loggedInUserId)
        {
            var comment = await _context.Pops
                .SelectMany(x => x.Comments)
                    .Include(x => x.ChildComments).ThenInclude(x => x.ChildComments)
                .FirstOrDefaultAsync(x => x.Pop.Id == popId && x.Id == commentId);
            if (comment == null)
            {
                return null;
            }
            return new CommentModel(comment, loggedInUserId);
        }
    }
}
