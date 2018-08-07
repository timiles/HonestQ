using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Statements;

namespace Pobs.Web.Services
{
    public interface IStatementService
    {
        Task<StatementListItemModel> SaveStatement(string text, string source, Stance stance, string[] topicSlugs, int postedByUserId);
        Task<StatementListItemModel> UpdateStatement(int statementId, string text, string source, Stance stance, string[] topicSlugs);
        Task<StatementModel> GetStatement(int statementId);
        Task<CommentModel> SaveComment(int statementId, string text, string source, int postedByUserId, AgreementRating? agreementRating, long? parentCommentId);
        Task<CommentModel> GetComment(int statementId, long commentId);
    }

    public class StatementService : IStatementService
    {
        private PobsDbContext _context;

        public StatementService(PobsDbContext context)
        {
            _context = context;
        }

        public async Task<StatementListItemModel> SaveStatement(string text, string source, Stance stance, string[] topicSlugs, int postedByUserId)
        {
            var topicTasks = new List<Task<Topic>>();
            if (topicSlugs != null)
            {
                foreach (var slug in topicSlugs)
                {
                    topicTasks.Add(_context.Topics.FirstOrDefaultAsync(x => x.Slug == slug));
                }
            }

            var postedByUserTask = _context.Users.FindAsync(postedByUserId);

            var statement = new Statement(text, await postedByUserTask, DateTime.UtcNow)
            {
                Source = source,
                Stance = stance,
            };

            await Task.WhenAll(topicTasks);
            foreach (var topicTask in topicTasks)
            {
                if (topicTask.Result != null)
                {
                    statement.Topics.Add(topicTask.Result);
                }
            }

            _context.Statements.Add(statement);
            await _context.SaveChangesAsync();

            return new StatementListItemModel(statement);
        }

        public async Task<StatementListItemModel> UpdateStatement(int statementId, string text, string source, Stance stance, string[] topicSlugs)
        {
            var topicTasks = new List<Task<Topic>>();
            if (topicSlugs != null)
            {
                foreach (var slug in topicSlugs)
                {
                    topicTasks.Add(_context.Topics.FirstOrDefaultAsync(x => x.Slug == slug));
                }
            }

            var statement = await _context.Statements
                .Include(x => x.Comments)
                .Include(x => x.StatementTopics)
                .FirstOrDefaultAsync(x => x.Id == statementId);
            if (statement == null)
            {
                return null;
            }

            statement.Text = text;
            statement.Slug = text.ToSlug();
            statement.Source = source;
            statement.Stance = stance;
            statement.Topics.Clear();

            await Task.WhenAll(topicTasks);
            foreach (var topicTask in topicTasks)
            {
                if (topicTask.Result != null)
                {
                    statement.Topics.Add(topicTask.Result);
                }
            }

            await _context.SaveChangesAsync();
            return new StatementListItemModel(statement);
        }

        public async Task<StatementModel> GetStatement(int statementId)
        {
            var statement = await _context.Statements
                .Include(x => x.Comments).ThenInclude(x => x.PostedByUser)
                .Include(x => x.StatementTopics).ThenInclude(x => x.Topic)
                .Include(x => x.Comments).ThenInclude(x => x.ChildComments)
                .FirstOrDefaultAsync(x => x.Id == statementId);
            if (statement == null)
            {
                return null;
            }
            return new StatementModel(statement, statement.Comments.Where(x => x.ParentComment == null));
        }

        public async Task<CommentModel> SaveComment(int statementId,
            string text, string source, int postedByUserId, AgreementRating? agreementRating, long? parentCommentId)
        {
            var statementTask = _context.Statements
                .Include(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Id == statementId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var statement = await statementTask;
            if (statement == null)
            {
                return null;
            }

            // Validate params
            if (agreementRating.HasValue)
            {
                if (parentCommentId.HasValue)
                {
                    throw new AppException("AgreementRating is invalid with ParentCommentId");
                }
                if (statement.Stance == Stance.ProveIt || statement.Stance == Stance.Question)
                {
                    throw new AppException($"AgreementRating is invalid when Stance is {statement.Stance}");
                }
            }

            Comment comment = (parentCommentId.HasValue) ?
                new Comment(text, await postedByUserTask, DateTime.UtcNow, parentCommentId.Value) :
                new Comment(text, await postedByUserTask, DateTime.UtcNow, agreementRating);

            comment.Source = source;
            statement.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentModel(comment) { ParentCommentId = parentCommentId };
        }

        public async Task<CommentModel> GetComment(int statementId, long commentId)
        {
            var comment = await _context.Statements
                .SelectMany(x => x.Comments)
                    .Include(x => x.PostedByUser)
                    .Include(x => x.ChildComments).ThenInclude(x => x.PostedByUser)
                    .Include(x => x.ChildComments).ThenInclude(x => x.ChildComments)
                .FirstOrDefaultAsync(x => x.Statement.Id == statementId && x.Id == commentId);
            if (comment == null)
            {
                return null;
            }
            return new CommentModel(comment);
        }
    }
}
