using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
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
    }
}
