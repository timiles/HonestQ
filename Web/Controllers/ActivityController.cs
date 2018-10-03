using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    // PRIVATE BETA
    [Authorize]

    [Route("api/[controller]")]
    public class ActivityController : Controller
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var activityList = await _activityService.ListActivities(20);
            return Ok(activityList);
        }
    }
}
