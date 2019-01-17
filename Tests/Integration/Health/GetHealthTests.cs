using System.Threading.Tasks;
using Xunit;

namespace Pobs.Tests.Integration.Health
{
    public class GetHealthTests
    {
        private const string Url = "/api/health";

        // This is also a good test to run to migrate the tests database
        [Fact]
        public async Task ShouldBeOK()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(Url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.StartsWith("OK: ", responseContent);
            }
        }
    }
}
