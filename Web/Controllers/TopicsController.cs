using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Topics;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    // PRIVATE BETA
    [Authorize]

    [Route("api/[controller]")]
    public class TopicsController : Controller
    {
        private readonly ITopicService _topicService;

        public TopicsController(ITopicService topicService)
        {
            _topicService = topicService;
        }

        [HttpGet]
        public async Task<IActionResult> Index(bool isApproved = true)
        {
            if (!isApproved && !User.IsInRole(Role.Admin))
            {
                return this.Forbid();
            }

            var topicsListModel = await _topicService.GetAllTopics(isApproved);
            return Ok(topicsListModel);
        }

        [Authorize]
        public async Task<IActionResult> Post([FromBody] TopicFormModel payload)
        {
            try
            {
                await _topicService.SaveTopic(payload.Name, payload.Summary, payload.MoreInfoUrl, User.Identity.ParseUserId());
                return Ok();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize, HttpPut, Route("{topicSlug}")]
        public async Task<IActionResult> Put(string topicSlug, [FromBody] EditTopicFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            try
            {
                var topicModel = await _topicService.UpdateTopic(topicSlug, payload.Slug, payload.Name,
                    payload.Summary, payload.MoreInfoUrl, payload.IsApproved);
                if (topicModel != null)
                {
                    return Ok(topicModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("{topicSlug}")]
        public async Task<IActionResult> Get(string topicSlug)
        {
            var topicModel = await _topicService.GetTopic(topicSlug, User.IsInRole(Role.Admin));
            if (topicModel != null)
            {
                return Ok(topicModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{topicSlug}/statements"), Authorize]
        public async Task<IActionResult> AddStatement(string topicSlug, [FromBody] StatementFormModel payload)
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

            var statementModel = await _topicService.SaveStatement(topicSlug, payload.Text, payload.Source, stance, User.Identity.ParseUserId());
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [Authorize, HttpPut, Route("{topicSlug}/statements/{statementId}")]
        public async Task<IActionResult> UpdateStatement(string topicSlug, int statementId, [FromBody] StatementFormModel payload)
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
                var statementModel = await _topicService.UpdateStatement(topicSlug, statementId, payload.Text, payload.Source, stance);
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

        [HttpGet, Route("{topicSlug}/statements/{statementId}")]
        public async Task<IActionResult> GetStatement(string topicSlug, int statementId)
        {
            var statementModel = await _topicService.GetStatement(topicSlug, statementId);
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{topicSlug}/statements/{statementId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(string topicSlug, int statementId, [FromBody] CommentFormModel payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Text) && string.IsNullOrWhiteSpace(payload.Source))
            {
                return BadRequest("Text or Source is required");
            }
            if (!Enum.TryParse<AgreementRating>(payload.AgreementRating, out AgreementRating agreementRating))
            {
                return BadRequest($"Invalid AgreementRating: {payload.AgreementRating}");
            }

            var commentModel = await _topicService.SaveComment(topicSlug, statementId,
                payload.Text, payload.Source, agreementRating, User.Identity.ParseUserId(), payload.ParentCommentId);
            if (commentModel != null)
            {
                return Ok(commentModel);
            }
            return NotFound();
        }
    }
}
