using Microsoft.AspNetCore.Mvc;
using Exceptionless;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Net;
using Microsoft.Extensions.Options;
using Pobs.Web.Helpers;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class HealthController : Controller
    {
        private readonly string _exceptionlessApiKey;

        public HealthController(IOptions<AppSettings> appSettings)
        {
            _exceptionlessApiKey = appSettings.Value.ExceptionlessApiKey;
        }

        public IActionResult Index(bool all)
        {
            ExceptionlessClient exceptionlessClient = null;
            var errors = new Dictionary<string, Exception>();
            if (all)
            {
                if (_exceptionlessApiKey != null)
                {
                    exceptionlessClient = new ExceptionlessClient(_exceptionlessApiKey);
                    try
                    {
                        // Test our connection to exceptionless (if it was initialized)
                        exceptionlessClient.SubmitLog("Health check");
                    }
                    catch (Exception ex)
                    {
                        errors.Add("Could not connect to Exceptionless", ex);
                    }
                }
            }

            if (errors.Any())
            {
                if (exceptionlessClient != null)
                {
                    foreach (var error in errors)
                    {
                        try
                        {
                            exceptionlessClient.SubmitException(error.Value);
                        }
                        catch
                        {
                        }
                    }
                }

                HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                return Content("ERROR: " + string.Join("; ", errors.Keys));
            }
            return Content("OK");
        }
    }
}
