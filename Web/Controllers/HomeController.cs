using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.Prerendering;
using Pobs.Web.Models.Account;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ISpaPrerenderer spaPrerenderer;
        private readonly IUserService userService;

        public HomeController(ISpaPrerenderer spaPrerenderer, IUserService userService)
        {
            this.spaPrerenderer = spaPrerenderer;
            this.userService = userService;
        }

        public async Task<IActionResult> Index()
        {
            LoggedInUserModel loggedInModel = null;
            if (Request.Cookies.TryGetValue("id_token", out string token))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var decodedToken = tokenHandler.ReadJwtToken(token);
                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                if (int.TryParse(identityClaim.Value, out int userId))
                {
                    var user = this.userService.GetById(userId);
                    if (user != null)
                    {
                        loggedInModel = new LoggedInUserModel(user, token);
                    }
                }
            }

            dynamic data = new
            {
                login = new
                {
                    loggedInUser = loggedInModel
                }
            };

            var renderResult = await this.spaPrerenderer.RenderToString("ClientApp/dist/main-server", null, data, 30000);
            if (!string.IsNullOrEmpty(renderResult.RedirectUrl))
            {
                if (renderResult.StatusCode != null && renderResult.StatusCode.Value == 301)
                {
                    return RedirectPermanent(renderResult.RedirectUrl);
                }
                return Redirect(renderResult.RedirectUrl);
            }
            if (renderResult.StatusCode != null)
            {
                this.HttpContext.Response.StatusCode = renderResult.StatusCode.Value;
            }

            return View("Index", renderResult);
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
