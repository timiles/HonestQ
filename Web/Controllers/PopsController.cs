using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    // PRIVATE BETA
    [Authorize]

    [Route("api/[controller]")]
    public class PopsController : Controller
    {
        private readonly IPopService _popService;

        public PopsController(IPopService popService)
        {
            _popService = popService;
        }

        [HttpPost, Authorize]
        public async Task<IActionResult> AddPop([FromBody] PopFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }
            if (string.IsNullOrWhiteSpace(payload.Type))
            {
                return BadRequest("Type is required");
            }
            if (!Enum.TryParse<PopType>(payload.Type, out PopType type))
            {
                return BadRequest($"Invalid Type: {payload.Type}");
            }

            var popModel = await _popService.SavePop(payload.Text, payload.Source, type, payload.TopicSlugs, User.Identity.ParseUserId());
            if (popModel != null)
            {
                return Ok(popModel);
            }
            return NotFound();
        }

        [Authorize, HttpPut, Route("{popId}")]
        public async Task<IActionResult> UpdatePop(int popId, [FromBody] PopFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(payload.Text))
            {
                return BadRequest("Text is required");
            }
            if (string.IsNullOrWhiteSpace(payload.Type))
            {
                return BadRequest("Type is required");
            }
            if (!Enum.TryParse<PopType>(payload.Type, out PopType type))
            {
                return BadRequest($"Invalid Type: {payload.Type}");
            }

            try
            {
                var popModel = await _popService.UpdatePop(popId, payload.Text, payload.Source, type, payload.TopicSlugs);
                if (popModel != null)
                {
                    return Ok(popModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("{popId}")]
        public async Task<IActionResult> GetPop(int popId)
        {
            var popModel = await _popService.GetPop(popId);
            if (popModel != null)
            {
                return Ok(popModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{popId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(int popId, [FromBody] CommentFormModel payload)
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
                var commentModel = await _popService.SaveComment(popId,
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

        [HttpGet, Route("{popId}/comments/{commentId}")]
        public async Task<IActionResult> GetComment(int popId, long commentId)
        {
            var commentModel = await _popService.GetComment(popId, commentId);
            if (commentModel != null)
            {
                return Ok(commentModel);
            }
            return NotFound();
        }
    }
}
