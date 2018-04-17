using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Pobs.Web;
using Xunit;

namespace Pobs.Tests.Integration
{
    public class UnitTest1
    {
        [Fact]
        public async Task Test1()
        {
            using (var server = new TestServer(new WebHostBuilder().UseStartup<Startup>().UseContentRoot("../../../../../Web")))
            using (var client = server.CreateClient())
            {
                var request = "/api/SampleData/WeatherForecasts";
                var response = await client.GetAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.NotNull(responseContent);
            }
        }
    }
}
