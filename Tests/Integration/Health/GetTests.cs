using System.Threading.Tasks;
using Xunit;

namespace Pobs.Tests.Integration.Health
{
    public class GetTests
    {
        private const string Url = "/api/health";

        [Fact]
        public async Task ShouldBeOK()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(Url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("OK", responseContent);
            }
        }
    }
}
