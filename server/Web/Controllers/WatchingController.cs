using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Helpers;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api")]
    public class WatchingController : Controller
    {
        private readonly IWatchingService _watchingService;

        public WatchingController(IWatchingService watchingService)
        {
            _watchingService = watchingService;
        }


        [Authorize, HttpPost, Route("tags/{tagSlug}/watch")]
        public async Task<IActionResult> AddTagWatch(string tagSlug)
        {
            try
            {
                var response = await _watchingService.AddWatchToTag(User.Identity.ParseUserId(), tagSlug);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                if (e.Message == "Watch already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpDelete, Route("tags/{tagSlug}/watch")]
        public async Task<IActionResult> RemoveTagWatch(string tagSlug)
        {
            try
            {
                var response = await _watchingService.RemoveWatchFromTag(User.Identity.ParseUserId(), tagSlug);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }


        [Authorize, HttpGet, Route("questions/_/watching")]
        public async Task<IActionResult> IndexQuestions(int pageSize = 20, long? beforeWatchId = null)
        {
            var loggedInUserId = User.Identity.ParseUserId();
            var questionsList = await _watchingService.ListQuestions(loggedInUserId, pageSize, beforeWatchId);
            return Ok(questionsList);
        }

        [Authorize, HttpPost, Route("questions/{questionId}/watch")]
        public async Task<IActionResult> AddQuestionWatch(int questionId)
        {
            try
            {
                var response = await _watchingService.AddWatchToQuestion(User.Identity.ParseUserId(), questionId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                if (e.Message == "Watch already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpDelete, Route("questions/{questionId}/watch")]
        public async Task<IActionResult> RemoveQuestionWatch(int questionId)
        {
            try
            {
                var response = await _watchingService.RemoveWatchFromQuestion(User.Identity.ParseUserId(), questionId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpPost, Route("questions/{questionId}/answers/{answerId}/watch")]
        public async Task<IActionResult> AddAnswerWatch(int questionId, int answerId)
        {
            try
            {
                var response = await _watchingService.AddWatchToAnswer(User.Identity.ParseUserId(), questionId, answerId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                if (e.Message == "Watch already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpDelete, Route("questions/{questionId}/answers/{answerId}/watch")]
        public async Task<IActionResult> RemoveAnswerWatch(int questionId, int answerId)
        {
            try
            {
                var response = await _watchingService.RemoveWatchFromAnswer(User.Identity.ParseUserId(), questionId, answerId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpPost, Route("questions/{questionId}/answers/{answerId}/comments/{commentId}/watch")]
        public async Task<IActionResult> AddCommentWatch(int questionId, int answerId, long commentId)
        {
            try
            {
                var response = await _watchingService.AddWatchToComment(User.Identity.ParseUserId(), questionId, answerId, commentId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                if (e.Message == "Watch already exists.")
                {
                    return Conflict(e.Message);
                }
                return BadRequest(e.Message);
            }
        }

        [Authorize, HttpDelete, Route("questions/{questionId}/answers/{answerId}/comments/{commentId}/watch")]
        public async Task<IActionResult> RemoveCommentWatch(int questionId, int answerId, long commentId)
        {
            try
            {
                var response = await _watchingService.RemoveWatchFromComment(User.Identity.ParseUserId(), questionId, answerId, commentId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
