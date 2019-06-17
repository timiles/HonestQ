using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Pobs.Comms;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web;

namespace Pobs.Tests.Integration
{
    public class IntegrationTestingServer : TestServer
    {
        public IntegrationTestingServer(IEmailSender emailSender = null) : base(
            new WebHostBuilder()
                .UseStartup<Startup>()
                .UseEnvironment("IntegrationTesting")
                .UseConfiguration(TestSetup.Configuration)
                .ConfigureServices(services =>
                {
                    services.AddScoped<IEmailSender>(provider => emailSender ?? new Mock<IEmailSender>().Object);
                }))
        {
        }
    }
}