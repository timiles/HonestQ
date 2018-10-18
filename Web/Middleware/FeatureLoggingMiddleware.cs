using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Exceptionless;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Pobs.Web.Helpers;

namespace Pobs.Web.Middleware
{
    public class FeatureLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IOptions<AppSettings> _appSettings;

        public FeatureLoggingMiddleware(RequestDelegate next, IOptions<AppSettings> appSettings)
        {
            _next = next;
            _appSettings = appSettings;
        }

        public async Task Invoke(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            await _next(context);
            stopwatch.Stop();

            if (_appSettings.Value.ExceptionlessApiKey != null)
            {
                try
                {
                    var routeData = context.GetRouteData();
                    var controller = routeData.Values["controller"] as string;
                    if (controller == "Health")
                    {
                        return;
                    }

                    var action = routeData.Values["action"] as string;
                    var method = context.Request.Method;
                    var featureName = $"{method}-{controller}-{action}";

                    var exceptionlessClient = new ExceptionlessClient(_appSettings.Value.ExceptionlessApiKey);
                    var feature = exceptionlessClient.CreateFeatureUsage(featureName)
                        .SetProperty("RequestDurationMilliseconds", stopwatch.ElapsedMilliseconds)
                        .SetProperty("UserAgent", context.Request.Headers[HeaderNames.UserAgent].ToString());

                    foreach (var value in routeData.Values)
                    {
                        if (value.Key != "controller" && value.Key != "action")
                        {
                            feature.SetProperty(value.Key, value.Value);
                        }
                    }

                    if (context.User.Identity.IsAuthenticated)
                    {
                        feature.SetUserIdentity(context.User.Identity.Name);
                    }

                    feature.Submit();
                }
                catch
                {
                    // Ignore
                }
            }
        }
    }

    public static class FeatureLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseFeatureLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<FeatureLoggingMiddleware>();
        }
    }
}
