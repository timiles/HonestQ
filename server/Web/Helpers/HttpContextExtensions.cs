
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.TagHelpers.Internal;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;

namespace Pobs.Web.Helpers
{
    public static class HttpContextExtensions
    {
        public static string AddFileVersionToPath(this HttpContext context, string path)
        {
            var hostingEnvironment = context.RequestServices.GetRequiredService<IHostingEnvironment>();
            var cache = context.RequestServices.GetRequiredService<IMemoryCache>();
            var versionProvider = new FileVersionProvider(hostingEnvironment.WebRootFileProvider, cache, context.Request.Path);
            return versionProvider.AddFileVersionToPath(path);
        }
    }
}