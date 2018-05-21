using System;
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

        [Route("{topicUrlFragment}"), AllowAnonymous]
        public async Task<IActionResult> Get(string topicUrlFragment)
        {
            try
            {
                var topicModel = await _topicService.Get(topicUrlFragment);
                return Ok(topicModel);
            }
            catch (EntityNotFoundException)
            {
                return NotFound();
            }
        }

        public class GetTopicModel
        {
            public string Name { get; set; }
            public IEnumerable<StatementModel> Statements { get; set; }

            public class StatementModel
            {
                public string Text { get; set; }
            }
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

        [HttpPost, Route("{topicUrlFragment}/statements")]
        public async Task<IActionResult> AddStatement(string topicUrlFragment, [FromBody] PostStatementModel payload)
        {
            try
            {
                await _topicService.SaveStatement(topicUrlFragment, payload.Text, User.Identity.ParseUserId());
                return Ok();
            }
            catch (EntityNotFoundException)
            {
                return NotFound();
            }
        }

        public class PostStatementModel
        {
            public string Text { get; set; }
        }
    }
}
