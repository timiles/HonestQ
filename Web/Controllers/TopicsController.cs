﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Topics;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class TopicsController : Controller
    {
        private readonly ITopicService _topicService;

        public TopicsController(ITopicService topicService)
        {
            _topicService = topicService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var topicsListModel = await _topicService.GetAll();
            return Ok(topicsListModel);
        }

        [Route("{topicUrlFragment}")]
        public async Task<IActionResult> Get(string topicUrlFragment)
        {
            var topicModel = await _topicService.Get(topicUrlFragment);
            if (topicModel != null)
            {
                return Ok(topicModel);
            }
            return NotFound();
        }

        [Authorize]
        public async Task<IActionResult> Post([FromBody] TopicFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            try
            {
                await _topicService.SaveTopic(payload.UrlFragment, payload.Name, User.Identity.ParseUserId());
                return Ok();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost, Route("{topicUrlFragment}/statements"), Authorize]
        public async Task<IActionResult> AddStatement(string topicUrlFragment, [FromBody] StatementFormModel payload)
        {
            var statementModel = await _topicService.SaveStatement(topicUrlFragment, payload.Text, User.Identity.ParseUserId());
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [HttpGet, Route("{topicUrlFragment}/statements/{statementId}")]
        public async Task<IActionResult> GetStatement(string topicUrlFragment, int statementId)
        {
            var statementModel = await _topicService.GetStatement(topicUrlFragment, statementId);
            if (statementModel != null)
            {
                return Ok(statementModel);
            }
            return NotFound();
        }

        [HttpPost, Route("{topicUrlFragment}/statements/{statementId}/comments"), Authorize]
        public async Task<IActionResult> AddComment(string topicUrlFragment, int statementId, [FromBody] CommentFormModel payload)
        {
            var commentModel = await _topicService.SaveComment(topicUrlFragment, statementId, payload.Text, User.Identity.ParseUserId());
            if (commentModel != null)
            {
                return Ok(commentModel);
            }
            return NotFound();
        }
    }
}
