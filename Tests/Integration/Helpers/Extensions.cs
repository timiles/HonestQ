using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Web.Helpers;

namespace Pobs.Tests.Integration.Helpers
{
    static class Extensions
    {
        public static void AuthenticateAs(this HttpClient httpClient, int userId, params Role[] roles)
        {
            var tokenString = AuthUtils.GenerateJwt(TestSetup.AppSettings.Secret, userId, roles);
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenString);
        }

        public static HttpContent ToJsonContent(this object o)
        {
            var json = JsonConvert.SerializeObject(o);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }

        public static SetCookieHeaderValue GetIdTokenCookie(this HttpResponseHeaders responseHeaders)
        {
            var setCookieHeader = responseHeaders.SingleOrDefault(x => x.Key == HeaderNames.SetCookie).Value;
            var cookies = setCookieHeader?.Select(x => SetCookieHeaderValue.Parse(x));
            return cookies?.SingleOrDefault(x => x.Name == "id_token");
        }
    }
}
