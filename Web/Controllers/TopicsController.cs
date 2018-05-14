﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]"), Authorize]
    public class TopicsController : Controller
    {
        private readonly ITopicService _topicService;

        public TopicsController(ITopicService topicService)
        {
            _topicService = topicService;
        }

        public async Task<IActionResult> Post([FromBody] PostTopicModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            await _topicService.SaveTopic(payload.UrlFragment, payload.Name, User.Identity.ParseUserId());
            return Ok();
        }

        public class PostTopicModel
        {
            public string UrlFragment { get; set; }
            public string Name { get; set; }
        }

        [HttpPost, Route("{topicUrlFragment}/opinions")]
        public async Task<IActionResult> AddOpinion(string topicUrlFragment, [FromBody] PostOpinionModel payload)
        {
            try
            {
                await _topicService.SaveOpinion(topicUrlFragment, payload.Text, User.Identity.ParseUserId());
                return Ok();
            }
            catch (EntityNotFoundException)
            {
                return NotFound();
            }
        }

        public class PostOpinionModel
        {
            public string Text { get; set; }
        }
    }
}
