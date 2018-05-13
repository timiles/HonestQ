using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
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

        public async Task<IActionResult> Post([FromBody] PostTopicModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            await _topicService.Save(payload.UrlFragment, payload.Name, User.Identity.ParseUserId());
            return Ok();
        }

        public class PostTopicModel
        {
            public string UrlFragment { get; set; }
            public string Name { get; set; }
        }
    }
}
