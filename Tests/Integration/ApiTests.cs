using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class ApiTests
    {
        [Fact]
        public async Task NotFoundApiUrl_ShouldReturn404NotFound()
        {
            using (var server = new TestServer(new WebHostBuilder()
                .UseStartup<Startup>().UseConfiguration(TestSetup.Configuration)))
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync("/api/invalid_endpoint");
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("", responseContent);
            }
        }
    }
}
