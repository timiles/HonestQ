using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace Pobs.Tests.Integration
{
    public class ApiTests
    {
        [Fact]
        public async Task NotFoundApiUrl_ShouldReturn404NotFound()
        {
            using (var server = new IntegrationTestingServer())
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
