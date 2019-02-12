using System.Threading.Tasks;
using Xunit;

namespace Pobs.Tests.Integration.Sitemap
{
    public class GetSitemapTests
    {
        private const string Url = "/sitemap.xml";

        [Fact]
        public async Task ShouldGetXml()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(Url);
                response.EnsureSuccessStatusCode();

                Assert.NotNull(response.Headers.CacheControl.MaxAge);
                Assert.Equal(1, response.Headers.CacheControl.MaxAge.Value.Days);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.NotEmpty(responseContent);
            }
        }
    }
}
