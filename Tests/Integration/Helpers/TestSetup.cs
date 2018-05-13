using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Pobs.Domain;
using Pobs.Web.Helpers;

namespace Pobs.Tests.Integration.Helpers
{
    static class TestSetup
    {
        internal static IConfiguration Configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

        internal static AppSettings AppSettings = Configuration.GetSection("AppSettings").Get<AppSettings>();

        internal static PobsDbContext CreateDbContext()
        {
            var connectionString = TestSetup.Configuration.GetConnectionString("DefaultConnection");
            var options = new DbContextOptionsBuilder<PobsDbContext>().UseSqlServer(connectionString).Options;
            return new PobsDbContext(options);
        }
    }
}
