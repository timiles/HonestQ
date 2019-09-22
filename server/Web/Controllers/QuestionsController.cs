using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Comms;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class QuestionsController : Controller
    {
        private readonly IQuestionService _questionService;
        private readonly INotificationsService _notificationsService;
        private readonly IWatchingService _watchingService;
        private readonly IEmailSender _emailSender;

        public QuestionsController(IQuestionService questionService,
            INotificationsService notificationsService,
            IWatchingService watchingService,
            IEmailSender emailSender)
        {
            _questionService = questionService;
            _notificationsService = notificationsService;
            _watchingService = watchingService;
            _emailSender = emailSender;
        }

        [HttpGet]
        public async Task<IActionResult> Index(
            PostStatus status = PostStatus.OK, int pageSize = 20, long? beforeTimestamp = null)
        {
            if (status == PostStatus.AwaitingApproval && !User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            var questionsList = await _questionService.ListQuestions(status, pageSize, beforeTimestamp);
            return Ok(questionsList);
        }

        [HttpGet, Route("_/answers")]
        public async Task<IActionResult> IndexAnswers(int pageSize = 20, long? beforeTimestamp = null)
        {
            var answersList = await _questionService.ListAnswers(pageSize, beforeTimestamp);
            return Ok(answersList);
        }

        [HttpGet, Route("search")]
        public async Task<IActionResult> Search(string q = null, long pageNumber = 1, long pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("Q is required.");
            }
            if (pageNumber < 1 || pageNumber > 9999)
            {
                return BadRequest("PageNumber must be between 1 and 9999.");
            }
            if (pageSize < 1 || pageSize > 200)
            {
                return BadRequest("PageSize must be between 1 and 200.");
            }


            var questionsList = await _questionService.SearchQuestions(q, (int)pageNumber, (int)pageSize);
            return Ok(questionsList);
        }

        [HttpPost, Authorize]
        public async Task<IActionResult> AddQuestion([FromBody] QuestionFormModel payload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(", ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage)));
            }

            var userId = User.Identity.ParseUserId();
            var isAdmin = User.IsInRole(Role.Admin);
            var questionModel = await _questionService.SaveQuestion(payload, userId, isAdmin);
            if (questionModel != null)
            {
                await _watchingService.AddWatchToQuestion(userId, questionModel.Id);
                if (isAdmin)
                {
                    await _notificationsService.CreateNotificationsForQuestion(questionModel.Id);
                    return Ok(questionModel);
                }
                else
                {
                    try
                    {
                        // Email admin to say a new question has been posted
                        _emailSender.SendQuestionAwaitingApprovalEmail(questionModel.Id, questionModel.Text);
                    }
                    catch
                    {
                    }
                }
                return Ok();
            }
            return NotFound();
        }

        [Authorize, HttpPut, Route("{questionId}")]
        public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] AdminQuestionFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(", ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage)));
            }

            try
            {
                var (questionModel, hasJustBeenApproved) = await _questionService.UpdateQuestion(questionId, payload);
                if (questionModel != null)
                {
                    if (hasJustBeenApproved)
                    {
                        await _notificationsService.CreateNotificationsForQuestion(questionModel.Id);
                    }
                    return Ok(questionModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("{questionId}")]
        public async Task<IActionResult> GetQuestion(int questionId)
        {
            var questionModel = await _questionService.GetQuestion(questionId,
                User.Identity.IsAuthenticated ? User.Identity.ParseUserId() : null as int?,
                User.IsInRole(Role.Admin));
            if (questionModel != null)
            {
                return Ok(questionModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{questionId}/answers"), Authorize]
        public async Task<IActionResult> AddAnswer(int questionId, [FromBody] AnswerFormModel payload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(", ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage)));
            }

            try
            {
                var userId = User.Identity.ParseUserId();
                var answerModel = await _questionService.SaveAnswer(questionId, payload, userId);
                if (answerModel != null)
                {
                    await _watchingService.AddWatchToAnswer(userId, questionId, answerModel.Id);
                    await _notificationsService.CreateNotificationsForAnswer(answerModel.Id);
                    answerModel.Watching = true;
                    return Ok(answerModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpPut, Route("{questionId}/answers/{answerId}")]
        public async Task<IActionResult> UpdateAnswer(int questionId, int answerId, [FromBody] AnswerFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(", ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage)));
            }

            try
            {
                var answerModel = await _questionService.UpdateAnswer(questionId, answerId, payload, User.Identity.ParseUserId());
                if (answerModel != null)
                {
                    return Ok(answerModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost, Route("{questionId}/answers/{answerId}/reactions/{reactionType}"), Authorize]
        public async Task<IActionResult> AddAnswerReaction(int questionId, int answerId, string reactionType)
        {
            if (string.IsNullOrEmpty(reactionType) ||
                !Enum.TryParse<ReactionType>(reactionType, out ReactionType r))
            {
                return BadRequest($"Invalid ReactionType: {reactionType}.");
            }

            try
            {
                var reactionModel = await _questionService.SaveAnswerReaction(questionId, answerId, r, User.Identity.ParseUserId());
                if (reactionModel != null)
                {
                    return Ok(reactionModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                if (e.Message == "Reaction already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [HttpDelete, Route("{questionId}/answers/{answerId}/reactions/{reactionType}"), Authorize]
        public async Task<IActionResult> DeleteAnswerReaction(int questionId, int answerId, string reactionType)
        {
            if (string.IsNullOrEmpty(reactionType) ||
                !Enum.TryParse<ReactionType>(reactionType, out ReactionType r))
            {
                return BadRequest($"Invalid ReactionType: {reactionType}.");
            }

            var responseModel = await _questionService.RemoveAnswerReaction(questionId, answerId, r, User.Identity.ParseUserId());
            if (responseModel != null)
            {
                return Ok(responseModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{questionId}/answers/{answerId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(int questionId, int answerId, [FromBody] CommentFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest($"Comment {nameof(payload.Text)} is required.");
            }

            try
            {
                var userId = User.Identity.ParseUserId();
                var commentModel = await _questionService.SaveComment(questionId, answerId, payload, userId);
                if (commentModel != null)
                {
                    await _notificationsService.CreateNotificationsForComment(commentModel.Id);
                    return Ok(commentModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut, Route("{questionId}/answers/{answerId}/comments/{commentId}"), Authorize]
        public async Task<IActionResult> UpdateComment(int questionId, int answerId, long commentId, [FromBody] CommentFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest($"Comment {nameof(payload.Text)} is required.");
            }

            try
            {
                var userId = User.Identity.ParseUserId();
                var commentModel = await _questionService.UpdateComment(questionId, answerId, commentId, payload, userId);
                if (commentModel != null)
                {
                    return Ok(commentModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost, Route("{questionId}/answers/{answerId}/comments/{commentId}/reactions/{reactionType}"), Authorize]
        public async Task<IActionResult> AddCommentReaction(int questionId, int answerId, long commentId, string reactionType)
        {
            if (string.IsNullOrEmpty(reactionType) ||
                !Enum.TryParse<ReactionType>(reactionType, out ReactionType r))
            {
                return BadRequest($"Invalid ReactionType: {reactionType}.");
            }

            try
            {
                var reactionModel = await _questionService.SaveCommentReaction(questionId, answerId, commentId, r, User.Identity.ParseUserId());
                if (reactionModel != null)
                {
                    return Ok(reactionModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                if (e.Message == "Reaction already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [HttpDelete, Route("{questionId}/answers/{answerId}/comments/{commentId}/reactions/{reactionType}"), Authorize]
        public async Task<IActionResult> DeleteCommentReaction(int questionId, int answerId, long commentId, string reactionType)
        {
            if (string.IsNullOrEmpty(reactionType) ||
                !Enum.TryParse<ReactionType>(reactionType, out ReactionType r))
            {
                return BadRequest($"Invalid ReactionType: {reactionType}.");
            }

            var responseModel = await _questionService.RemoveCommentReaction(questionId, answerId, commentId, r, User.Identity.ParseUserId());
            if (responseModel != null)
            {
                return Ok(responseModel);
            }
            return NotFound();
        }
    }
}
