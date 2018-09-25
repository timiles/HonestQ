using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Questions;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    // PRIVATE BETA
    [Authorize]

    [Route("api/[controller]")]
    public class QuestionsController : Controller
    {
        private readonly IQuestionService _questionService;

        public QuestionsController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpPost, Authorize]
        public async Task<IActionResult> AddQuestion([FromBody] QuestionFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }

            var questionModel = await _questionService.SaveQuestion(payload, User.Identity.ParseUserId());
            if (questionModel != null)
            {
                return Ok(questionModel);
            }
            return NotFound();
        }

        [Authorize, HttpPut, Route("{questionId}")]
        public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] QuestionFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }

            try
            {
                var questionModel = await _questionService.UpdateQuestion(questionId, payload);
                if (questionModel != null)
                {
                    return Ok(questionModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var questionsList = await _questionService.ListQuestions();
            return Ok(questionsList);
        }

        [HttpGet, Route("{questionId}")]
        public async Task<IActionResult> GetQuestion(int questionId)
        {
            var questionModel = await _questionService.GetQuestion(questionId,
                User.Identity.IsAuthenticated ? User.Identity.ParseUserId() : null as int?);
            if (questionModel != null)
            {
                return Ok(questionModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{questionId}/answers"), Authorize]
        public async Task<IActionResult> AddAnswer(int questionId, [FromBody] AnswerFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest($"{nameof(payload.Text)} is required");
            }

            try
            {
                var answerModel = await _questionService.SaveAnswer(questionId, payload, User.Identity.ParseUserId());
                if (answerModel != null)
                {
                    return Ok(answerModel);
                }
                return NotFound();
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost, Route("{questionId}/answers/{answerId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(int questionId, int answerId, [FromBody] CommentFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text) && string.IsNullOrWhiteSpace(payload.Source))
            {
                return BadRequest($"{nameof(payload.Text)} or {nameof(payload.Source)} is required");
            }
            if (string.IsNullOrEmpty(payload.AgreementRating) ||
                !Enum.TryParse<AgreementRating>(payload.AgreementRating, out AgreementRating a))
            {
                return BadRequest($"Invalid {nameof(payload.AgreementRating)}: {payload.AgreementRating}");
            }

            try
            {
                var commentModel = await _questionService.SaveComment(questionId, answerId, payload, User.Identity.ParseUserId());
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
    }
}
