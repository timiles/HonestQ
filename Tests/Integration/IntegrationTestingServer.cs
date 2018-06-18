using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;

namespace Pobs.Tests.Integration
{
    public class IntegrationTestingServer : TestServer
    {
        public IntegrationTestingServer() : base(
            new WebHostBuilder()
                .UseStartup<Startup>()
                .UseEnvironment("IntegrationTesting")
                .UseConfiguration(TestSetup.Configuration))
        {
        }
    }
}