using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace Pobs.Tests.Integration.Helpers
{
    static class Extensions
    {
        public static HttpContent ToJsonContent(this object o)
        {
            var json = JsonConvert.SerializeObject(o);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }
    }
}
