using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Domain.Utils;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Questions;

namespace Pobs.Web.Services
{
    public interface IQuestionService
    {
        Task<QuestionsListModel> ListQuestions(int pageSize, long? beforeUnixTimeMilliseconds = null);
        Task<QuestionListItemModel> SaveQuestion(QuestionFormModel questionForm, int postedByUserId);
        Task<QuestionListItemModel> UpdateQuestion(int questionId, QuestionFormModel questionForm);
        Task<QuestionModel> GetQuestion(int questionId, int? loggedInUserId);
        Task<AnswerModel> SaveAnswer(int questionId, AnswerFormModel answerForm, int postedByUserId);
        Task<AnswerModel> UpdateAnswer(int questionId, int answerId, AnswerFormModel answerForm);
        Task<ReactionModel> SaveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId);
        Task<ReactionModel> RemoveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId);
        Task<CommentModel> SaveComment(int questionId, int answerId, CommentFormModel commentForm, int postedByUserId);
        Task<ReactionModel> SaveCommentReaction(int questionId, int answerId, long commentId, ReactionType reactionType, int postedByUserId);
        Task<ReactionModel> RemoveCommentReaction(int questionId, int answerId, long commentId, ReactionType reactionType, int postedByUserId);
    }

    public class QuestionService : IQuestionService
    {
        private HonestQDbContext _context;

        public QuestionService(HonestQDbContext context)
        {
            _context = context;
        }

        public async Task<QuestionsListModel> ListQuestions(int pageSize, long? beforeUnixTimeMilliseconds = null)
        {
            var beforeTime = beforeUnixTimeMilliseconds.ToUnixDateTime() ?? DateTime.UtcNow;

            var questions = await _context.Questions
                .Include(x => x.Answers)
                .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Where(x => x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();
            return new QuestionsListModel(questions);
        }

        public async Task<QuestionListItemModel> SaveQuestion(QuestionFormModel questionForm, int postedByUserId)
        {
            var tagTasks = new List<Task<Tag>>();
            if (questionForm.Tags != null)
            {
                foreach (var tag in questionForm.Tags)
                {
                    tagTasks.Add(_context.Tags.FirstOrDefaultAsync(x => x.Slug == tag.Slug));
                }
            }

            var postedByUserTask = _context.Users.FindAsync(postedByUserId);

            var question = new Question(questionForm.Text, await postedByUserTask, DateTime.UtcNow)
            {
                Source = questionForm.Source,
            };

            await Task.WhenAll(tagTasks);
            foreach (var tagTask in tagTasks)
            {
                var tag = tagTask.Result;
                if (tag != null)
                {
                    question.Tags.Add(tag);
                }
            }

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return new QuestionListItemModel(question);
        }

        public async Task<QuestionListItemModel> UpdateQuestion(int questionId, QuestionFormModel questionForm)
        {
            var tagTasks = new List<Task<Tag>>();
            if (questionForm.Tags != null)
            {
                foreach (var tag in questionForm.Tags)
                {
                    tagTasks.Add(_context.Tags.FirstOrDefaultAsync(x => x.Slug == tag.Slug));
                }
            }

            var question = await _context.Questions
                .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null)
            {
                return null;
            }

            question.Text = questionForm.Text;
            question.Slug = questionForm.Text.ToSlug();
            question.Source = questionForm.Source;
            question.Tags.Clear();

            await Task.WhenAll(tagTasks);
            foreach (var tagTask in tagTasks)
            {
                var tag = tagTask.Result;
                if (tag != null)
                {
                    question.Tags.Add(tag);
                }
            }

            await _context.SaveChangesAsync();
            return new QuestionListItemModel(question);
        }

        public async Task<QuestionModel> GetQuestion(int questionId, int? loggedInUserId)
        {
            var question = await _context.Questions
                .Include(x => x.PostedByUser)
                .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Include(x => x.Answers).ThenInclude(x => x.PostedByUser)
                .Include(x => x.Answers).ThenInclude(x => x.Reactions)
                .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.PostedByUser)
                .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null)
            {
                return null;
            }
            return new QuestionModel(question, loggedInUserId);
        }

        public async Task<AnswerModel> SaveAnswer(int questionId, AnswerFormModel answerForm, int postedByUserId)
        {
            var questionTask = _context.Questions
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var question = await questionTask;
            if (question == null)
            {
                return null;
            }

            var answer = new Answer(answerForm.Text, await postedByUserTask, DateTime.UtcNow)
            {
                Source = answerForm.Source
            };

            question.Answers.Add(answer);
            await _context.SaveChangesAsync();

            return new AnswerModel(answer, postedByUserId);
        }

        public async Task<AnswerModel> UpdateAnswer(int questionId, int answerId, AnswerFormModel answerForm)
        {
            var question = await _context.Questions
                .Include(x => x.Answers).ThenInclude(x => x.PostedByUser)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            var answer = question?.Answers?.FirstOrDefault(x => x.Id == answerId);
            if (answer == null)
            {
                return null;
            }

            answer.Text = answerForm.Text;
            answer.Slug = answerForm.Text.ToSlug();
            answer.Source = answerForm.Source;

            await _context.SaveChangesAsync();
            return new AnswerModel(answer);
        }

        public async Task<ReactionModel> SaveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId)
        {
            var answer = await _context.Questions
                .SelectMany(x => x.Answers)
                .Include(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == answerId && x.Question.Id == questionId);
            if (answer == null)
            {
                return null;
            }

            if (answer.Reactions.Any(x => x.PostedByUserId == postedByUserId && x.Type == reactionType))
            {
                throw new AppException("Reaction already exists.");
            }

            answer.Reactions.Add(new Reaction(reactionType, postedByUserId, DateTimeOffset.UtcNow));
            await _context.SaveChangesAsync();

            return new ReactionModel(questionId, answer, reactionType, postedByUserId);
        }

        public async Task<ReactionModel> RemoveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId)
        {
            var answer = await _context.Questions
                .SelectMany(x => x.Answers)
                .Include(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == answerId && x.Question.Id == questionId);

            var reaction = answer?.Reactions.FirstOrDefault(x => x.PostedByUserId == postedByUserId && x.Type == reactionType);
            if (reaction == null)
            {
                return null;
            }

            answer.Reactions.Remove(reaction);
            await _context.SaveChangesAsync();

            return new ReactionModel(questionId, answer, reactionType, postedByUserId);
        }

        public async Task<CommentModel> SaveComment(int questionId, int answerId, CommentFormModel commentForm, int postedByUserId)
        {
            var questionTask = _context.Questions
                .Include(x => x.Answers).ThenInclude(x => x.Comments)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            var postedByUserTask = _context.Users.FindAsync(postedByUserId);
            var question = await questionTask;
            if (question == null)
            {
                return null;
            }

            var answer = question.Answers.FirstOrDefault(x => x.Id == answerId);
            if (answer == null)
            {
                return null;
            }

            Enum.TryParse<AgreementRating>(commentForm.AgreementRating, out AgreementRating agreementRating);
            var comment = new Comment(commentForm.Text, await postedByUserTask, DateTime.UtcNow, agreementRating, commentForm.ParentCommentId)
            {
                Source = commentForm.Source,
                IsAnonymous = commentForm.IsAnonymous,
                Status = commentForm.IsAnonymous ? CommentStatus.AwaitingApproval : CommentStatus.OK,
            };

            answer.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentModel(comment, postedByUserId);
        }

        public async Task<ReactionModel> SaveCommentReaction(int questionId, int answerId, long commentId, ReactionType reactionType, int postedByUserId)
        {
            var comment = await _context.Questions
                .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                .Include(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == commentId && x.Answer.Id == answerId && x.Answer.Question.Id == questionId);
            if (comment == null)
            {
                return null;
            }

            if (comment.Reactions.Any(x => x.PostedByUserId == postedByUserId && x.Type == reactionType))
            {
                throw new AppException("Reaction already exists.");
            }

            comment.Reactions.Add(new Reaction(reactionType, postedByUserId, DateTimeOffset.UtcNow));
            await _context.SaveChangesAsync();

            return new ReactionModel(questionId, answerId, comment, reactionType, postedByUserId);
        }

        public async Task<ReactionModel> RemoveCommentReaction(int questionId, int answerId, long commentId, ReactionType reactionType, int postedByUserId)
        {
            var comment = await _context.Questions
                .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                .Include(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == commentId && x.Answer.Id == answerId && x.Answer.Question.Id == questionId);

            var reaction = comment?.Reactions.FirstOrDefault(x => x.PostedByUserId == postedByUserId && x.Type == reactionType);
            if (reaction == null)
            {
                return null;
            }

            comment.Reactions.Remove(reaction);
            await _context.SaveChangesAsync();

            return new ReactionModel(questionId, answerId, comment, reactionType, postedByUserId);
        }
    }
}
