using Microsoft.AspNetCore.Mvc;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class HealthController : Controller
    {
        public IActionResult Index()
        {
            return Content("OK");
        }
    }
}
