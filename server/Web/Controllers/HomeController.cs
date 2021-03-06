using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Exceptionless;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.Prerendering;
using Microsoft.Extensions.Options;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Account;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ISpaPrerenderer _spaPrerenderer;
        private readonly IUserService _userService;
        private readonly AppSettings _appSettings;

        public HomeController(ISpaPrerenderer spaPrerenderer, IUserService userService, IOptions<AppSettings> appSettings)
        {
            _spaPrerenderer = spaPrerenderer;
            _userService = userService;
            _appSettings = appSettings.Value;
        }

        public async Task<IActionResult> Index()
        {
            LoggedInUserModel loggedInModel = null;
            if (Request.Cookies.TryGetValue("id_token", out string token))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var decodedToken = tokenHandler.ReadJwtToken(token);

                if (decodedToken.ValidTo < DateTime.UtcNow)
                {
                    // JWT expired? Clear the cookie and redirect to /login
                    this.Response.Cookies.Delete("id_token");
                    return Redirect("/login");
                }

                var identityClaim = decodedToken.Claims.Single(x => x.Type == "unique_name");
                if (int.TryParse(identityClaim.Value, out int userId))
                {
                    var user = _userService.GetById(userId);
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
                },
                versionedAssetPaths = new
                {
                    vendorCss = this.HttpContext.AddFileVersionToPath("/dist/vendor.css"),
                    siteCss = this.HttpContext.AddFileVersionToPath("/dist/site.css"),
                    vendorJs = this.HttpContext.AddFileVersionToPath("/dist/vendor.js"),
                    mainClientJs = this.HttpContext.AddFileVersionToPath("/dist/main-client.js")
                }
            };

            try
            {
                var renderResult = (RenderToStringResult)await _spaPrerenderer.RenderToString("ClientApp/dist/main-server", null, data, 30000);
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
                return Content(renderResult.Html, "text/html");
            }
            catch (Exception ex)
            {
                if (_appSettings.ExceptionlessApiKey != null)
                {
                    try
                    {
                        var exceptionlessClient = new ExceptionlessClient(_appSettings.ExceptionlessApiKey);
                        exceptionlessClient.SubmitException(ex);
                    }
                    catch { }
                }
                this.HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                return View("Error");
            }
        }
    }
}
