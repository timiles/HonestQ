using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Helpers;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Authorize, Route("api/[controller]")]
    public class WatchingController : Controller
    {
        private readonly IWatchingService watchingService;

        public WatchingController(IWatchingService watchingService)
        {
            this.watchingService = watchingService;
        }

        [HttpGet, Route("questions")]
        public async Task<IActionResult> GetQuestions()
        {
            return Ok(await this.watchingService.GetQuestions(User.Identity.ParseUserId()));
        }

        [HttpGet, Route("answers")]
        public async Task<IActionResult> GetAnswers()
        {
            return Ok(await this.watchingService.GetAnswers(User.Identity.ParseUserId()));
        }
    }
}
