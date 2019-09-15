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
        Task<QuestionsListModel> ListQuestions(PostStatus status, int pageSize, long? beforeUnixTimeMilliseconds = null);
        Task<AnswersListModel> ListAnswers(int pageSize, long? beforeUnixTimeMilliseconds = null);
        Task<QuestionSearchResultsModel> SearchQuestions(string query, int pageNumber, int pageSize);
        Task<QuestionListItemModel> SaveQuestion(QuestionFormModel questionForm, int postedByUserId, bool isAdmin);
        Task<(QuestionListItemModel questionModel, bool hasJustBeenApproved)> UpdateQuestion(int questionId, AdminQuestionFormModel questionForm);
        Task<QuestionModel> GetQuestion(int questionId, int? loggedInUserId, bool isAdmin);
        Task<AnswerModel> SaveAnswer(int questionId, AnswerFormModel answerForm, int postedByUserId);
        Task<AnswerModel> UpdateAnswer(int questionId, int answerId, AnswerFormModel answerForm, int? loggedInUserId);
        Task<ReactionModel> SaveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId);
        Task<ReactionModel> RemoveAnswerReaction(int questionId, int answerId, ReactionType reactionType, int postedByUserId);
        Task<CommentModel> SaveComment(int questionId, int answerId, CommentFormModel commentForm, int postedByUserId);
        Task<CommentModel> UpdateComment(int questionId, int answerId, long commentId, CommentFormModel commentForm, int? loggedInUserId);
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

        public async Task<QuestionsListModel> ListQuestions(
            PostStatus status, int pageSize, long? beforeUnixTimeMilliseconds = null)
        {
            var beforeTime = beforeUnixTimeMilliseconds.ToUnixDateTime() ?? DateTime.UtcNow;

            var questions = await _context.Questions
                .Include(x => x.Answers)
                .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Where(x => x.Status == status && x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();
            return new QuestionsListModel(questions);
        }

        public async Task<AnswersListModel> ListAnswers(int pageSize, long? beforeUnixTimeMilliseconds = null)
        {
            var beforeTime = beforeUnixTimeMilliseconds.ToUnixDateTime() ?? DateTime.UtcNow;

            var answers = await _context.Questions
                .SelectMany(x => x.Answers)
                .Include(x => x.Question)
                .Where(x => x.PostedAt < beforeTime)
                .OrderByDescending(x => x.PostedAt)
                .Take(pageSize)
                .ToListAsync();
            return new AnswersListModel(answers);
        }

        public async Task<QuestionSearchResultsModel> SearchQuestions(string query, int pageNumber, int pageSize)
        {
            var questions = await _context.QuestionSearch
                .FromSql(@"
                    SELECT * FROM (SELECT Id AS QuestionId, MATCH(Text) AGAINST (@query) AS MatchScore FROM Question) x
                    INNER JOIN Question q ON x.QuestionId = q.Id
                ",
                    new MySql.Data.MySqlClient.MySqlParameter("query", query))
                .Include(x => x.Question)
                .Include(x => x.Question).ThenInclude(x => x.Answers)
                .Include(x => x.Question).ThenInclude(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Where(x => x.Question.Status == PostStatus.OK && x.MatchScore > 0)
                .OrderByDescending(x => x.MatchScore).ThenByDescending(x => x.Question.PostedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize + 1)
                .ToListAsync();

            var moreRecordsExist = questions.Count() > pageSize;
            return new QuestionSearchResultsModel(query, pageNumber, pageSize,
                questions.Select(x => x.Question).Take(pageSize), moreRecordsExist);
        }

        public async Task<QuestionListItemModel> SaveQuestion(QuestionFormModel questionForm, int postedByUserId, bool isAdmin)
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

            var question = new Question(questionForm.Text.CleanText(), await postedByUserTask, DateTime.UtcNow)
            {
                Context = questionForm.Context.CleanText(),
                Status = isAdmin ? PostStatus.OK : PostStatus.AwaitingApproval,
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

        public async Task<(QuestionListItemModel, bool)> UpdateQuestion(int questionId, AdminQuestionFormModel questionForm)
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
                return (null, false);
            }

            var originalStatus = question.Status;

            question.Text = questionForm.Text.CleanText();
            question.Slug = questionForm.Text.ToSlug();
            question.Context = questionForm.Context.CleanText();
            question.Status = questionForm.IsApproved ? PostStatus.OK : PostStatus.AwaitingApproval;
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
            var hasJustBeenApproved = originalStatus == PostStatus.AwaitingApproval && questionForm.IsApproved;
            return (new QuestionListItemModel(question), hasJustBeenApproved);
        }

        public async Task<QuestionModel> GetQuestion(int questionId, int? loggedInUserId, bool isAdmin)
        {
            var question = await _context.Questions
                .Include(x => x.QuestionTags).ThenInclude(x => x.Tag)
                .Include(x => x.Watches)
                .Include(x => x.Answers).ThenInclude(x => x.Reactions)
                .Include(x => x.Answers).ThenInclude(x => x.Watches)
                .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.PostedByUser)
                .Include(x => x.Answers).ThenInclude(x => x.Comments).ThenInclude(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            if (question == null || (question.Status == PostStatus.AwaitingApproval && !isAdmin))
            {
                return null;
            }
            return (isAdmin) ? new AdminQuestionModel(question, loggedInUserId) : new QuestionModel(question, loggedInUserId);
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

            var user = await postedByUserTask;
            var answer = new Answer(answerForm.Text, user, DateTime.UtcNow);

            if (!string.IsNullOrWhiteSpace(answerForm.CommentText) ||
              !string.IsNullOrWhiteSpace(answerForm.CommentSource))
            {
                var comment = new Comment(answerForm.CommentText, user, DateTime.UtcNow, true, null)
                {
                    Source = answerForm.CommentSource.CleanText(),
                };
                answer.Comments.Add(comment);
            }

            question.Answers.Add(answer);
            await _context.SaveChangesAsync();

            return new AnswerModel(answer, postedByUserId);
        }

        public async Task<AnswerModel> UpdateAnswer(int questionId, int answerId, AnswerFormModel answerForm, int? loggedInUserId)
        {
            var question = await _context.Questions
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(x => x.Id == questionId);
            var answer = question?.Answers?.FirstOrDefault(x => x.Id == answerId);
            if (answer == null)
            {
                return null;
            }

            answer.Text = answerForm.Text;
            answer.Slug = answerForm.Text.ToSlug();

            await _context.SaveChangesAsync();
            return new AnswerModel(answer, loggedInUserId);
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

            var comment = new Comment(commentForm.Text.CleanText(), await postedByUserTask, DateTime.UtcNow,
                commentForm.IsAgree, commentForm.ParentCommentId)
            {
                Source = commentForm.Source.CleanText(),
                IsAnonymous = commentForm.IsAnonymous,
                Status = commentForm.IsAnonymous ? PostStatus.AwaitingApproval : PostStatus.OK,
            };

            answer.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new CommentModel(comment, postedByUserId);
        }

        public async Task<CommentModel> UpdateComment(int questionId, int answerId, long commentId,
            CommentFormModel commentForm, int? loggedInUserId)
        {
            var comment = await _context.Questions
                .SelectMany(x => x.Answers).SelectMany(x => x.Comments)
                .Include(x => x.PostedByUser)
                .Include(x => x.Reactions)
                .FirstOrDefaultAsync(x => x.Id == commentId && x.Answer.Id == answerId && x.Answer.Question.Id == questionId);
            if (comment == null)
            {
                return null;
            }

            comment.Text = commentForm.Text.CleanText();
            comment.Source = commentForm.Source.CleanText();
            comment.AgreementRating = commentForm.IsAgree ? AgreementRating.Agree : AgreementRating.Disagree;

            await _context.SaveChangesAsync();
            return new CommentModel(comment, loggedInUserId);
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
