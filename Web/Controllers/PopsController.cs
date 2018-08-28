using System;
using System.Collections.Generic;
using System.Linq;
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
            var validatedPopModel = Validate(payload);
            if (validatedPopModel.error != null)
            {
                return BadRequest(validatedPopModel.error);
            }

            var popModel = await _popService.SavePop(validatedPopModel.model, User.Identity.ParseUserId());
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

            var validatedPopModel = Validate(payload);
            if (validatedPopModel.error != null)
            {
                return BadRequest(validatedPopModel.error);
            }

            try
            {
                var popModel = await _popService.UpdatePop(popId, validatedPopModel.model);
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

        private static (ValidatedPopModel model, string error) Validate(PopFormModel form)
        {
            if (string.IsNullOrWhiteSpace(form.Text))
            {
                return (null, "Text is required");
            }
            if (string.IsNullOrWhiteSpace(form.Type))
            {
                return (null, "Type is required");
            }
            if (!Enum.TryParse<PopType>(form.Type, out PopType type))
            {
                return (null, $"Invalid Type: {form.Type}");
            }

            Dictionary<string, Stance?> topics = null;
            if (form.Topics != null)
            {
                topics = new Dictionary<string, Stance?>();
                foreach (var topic in form.Topics)
                {
                    if (topic.Stance == null)
                    {
                        if (type == PopType.Statement)
                        {
                            return (null, "Stance is required when Type is Statement");
                        }
                        topics[topic.Slug] = null;
                        continue;
                    }
                    if (!Enum.TryParse<Stance>(topic.Stance, out Stance stance))
                    {
                        return (null, $"Invalid Stance: {topic.Stance}");
                    }
                    if (type != PopType.Statement)
                    {
                        return (null, $"Stance is invalid when Type is {type}");
                    }
                    topics[topic.Slug] = stance;
                }
            }

            var validatedPopModel = new ValidatedPopModel
            {
                Text = form.Text,
                Source = form.Source,
                Type = type,
                Topics = topics
            };
            return (validatedPopModel, null);
        }

        [HttpGet, Route("{popId}")]
        public async Task<IActionResult> GetPop(int popId)
        {
            var popModel = await _popService.GetPop(popId,
                User.Identity.IsAuthenticated ? User.Identity.ParseUserId() : null as int?);
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
            var commentModel = await _popService.GetComment(popId, commentId,
                User.Identity.IsAuthenticated ? User.Identity.ParseUserId() : null as int?);
            if (commentModel != null)
            {
                return Ok(commentModel);
            }
            return NotFound();
        }
    }
}
