using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class ActivityController : Controller
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet]
        public async Task<IActionResult> Index(int pageSize = 20, long? beforeTimestamp = null)
        {
            var activityList = await _activityService.ListActivity(pageSize, beforeTimestamp);
            return Ok(activityList);
        }
    }
}
