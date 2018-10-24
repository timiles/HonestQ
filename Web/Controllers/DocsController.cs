using Microsoft.AspNetCore.Mvc;

namespace Pobs.Web.Controllers
{
    public class DocsController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TermsOfService()
        {
            return View();
        }

        [HttpGet]
        public IActionResult PrivacyPolicy()
        {
            return View();
        }
    }
}
