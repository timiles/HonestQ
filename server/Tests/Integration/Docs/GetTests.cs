using System.Threading.Tasks;
using Xunit;

namespace Pobs.Tests.Integration.Docs
{
    public class GetTests
    {
        [Theory]
        [InlineData("/docs", "<title>Docs - HonestQ</title>")]
        [InlineData("/docs/PrivacyPolicy", "<title>Privacy Policy - HonestQ</title>", "<h2>Privacy Policy</h2>")]
        [InlineData("/docs/TermsOfService", "<title>Terms of Service - HonestQ</title>", "<h2>Terms of Service</h2>")]
        public async Task GetDocsUrl_ShouldContainExpectedHtml(string url, params string[] expectedHtmls)
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Contains(@"<h1><a href=""/"">HonestQ.com</a></h1>", responseContent);
                foreach (var expectedHtml in expectedHtmls)
                {
                    Assert.Contains(expectedHtml, responseContent);
                }
            }
        }
    }
}
