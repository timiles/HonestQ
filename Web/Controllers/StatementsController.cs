using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Statements;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    // PRIVATE BETA
    [Authorize]

    [Route("api/[controller]")]
    public class StatementsController : Controller
    {
        private readonly IStatementService _statementService;

        public StatementsController(IStatementService statementService)
        {
            _statementService = statementService;
        }

        [HttpPost, Authorize]
        public async Task<IActionResult> AddStatement([FromBody] StatementFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }
            if (string.IsNullOrWhiteSpace(payload.Stance))
            {
                return BadRequest("Stance is required");
            }
            if (!Enum.TryParse<Stance>(payload.Stance, out Stance stance))
            {
                return BadRequest($"Invalid Stance: {payload.Stance}");
            }

            var statementModel = await _statementService.SaveStatement(payload.Text, payload.Source, stance, payload.TopicSlugs, User.Identity.ParseUserId());
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [Authorize, HttpPut, Route("{statementId}")]
        public async Task<IActionResult> UpdateStatement(int statementId, [FromBody] StatementFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }
            if (string.IsNullOrWhiteSpace(payload.Stance))
            {
                return BadRequest("Stance is required");
            }
            if (!Enum.TryParse<Stance>(payload.Stance, out Stance stance))
            {
                return BadRequest($"Invalid Stance: {payload.Stance}");
            }

            try
            {
                var statementModel = await _statementService.UpdateStatement(statementId, payload.Text, payload.Source, stance, payload.TopicSlugs);
                if (statementModel != null)
                {
                    return Ok(statementModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("{statementId}")]
        public async Task<IActionResult> GetStatement(int statementId)
        {
            var statementModel = await _statementService.GetStatement(statementId);
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{statementId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(int statementId, [FromBody] CommentFormModel payload)
        {
            AgreementRating? agreementRating = null;

            if (string.IsNullOrWhiteSpace(payload.Text) && string.IsNullOrWhiteSpace(payload.Source))
            {
                return BadRequest($"{nameof(payload.Text)} or {nameof(payload.Source)} is required");
            }
            if (!string.IsNullOrEmpty(payload.AgreementRating))
            {
                if (Enum.TryParse<AgreementRating>(payload.AgreementRating, out AgreementRating a))
                {
                    agreementRating = a;
                }
                else
                {
                    return BadRequest($"Invalid {nameof(payload.AgreementRating)}: {payload.AgreementRating}");
                }
            }

            try
            {
                var commentModel = await _statementService.SaveComment(statementId,
                    payload.Text, payload.Source, User.Identity.ParseUserId(), agreementRating, payload.ParentCommentId);
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

        [HttpGet, Route("{statementId}/comments/{commentId}")]
        public async Task<IActionResult> GetComment(int statementId, long commentId)
        {
            var commentModel = await _statementService.GetComment(statementId, commentId);
            if (commentModel != null)
            {
                return Ok(commentModel);
            }
            return NotFound();
        }
    }
}
