using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Pobs.Web.Middleware
{
    // This is necessary for IE11
    public class DisableApiResponseCachingMiddleware
    {
        private readonly RequestDelegate _next;
        public DisableApiResponseCachingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            if (context.Request.Path.Value.Contains("/api/"))
            {
                context.Response.Headers.Add("Cache-Control", "public,max-age=0");
            }

            // Call the next delegate/middleware in the pipeline
            return this._next(context);
        }
    }

    public static class ResponseCachingMiddlewareExtensions
    {
        public static IApplicationBuilder UseDisableApiResponseCaching(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<DisableApiResponseCachingMiddleware>();
        }
    }
}