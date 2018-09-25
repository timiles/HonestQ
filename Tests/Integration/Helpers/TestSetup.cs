using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace Pobs.Tests.Integration.Helpers
{
    static class TestSetup
    {
        internal static IConfiguration Configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

        internal static AppSettings AppSettings = Configuration.GetSection("AppSettings").Get<AppSettings>();

        static readonly Lazy<DbContextPool<HonestQDbContext>> honestQDbContextPool = new Lazy<DbContextPool<HonestQDbContext>>(() =>
        {
            var connectionString = TestSetup.Configuration.GetConnectionString("DefaultConnection");
            var options = new DbContextOptionsBuilder<HonestQDbContext>().UseMySql(
                connectionString,
                b =>
                {
                    b.ServerVersion(new Version(5, 7, 21), ServerType.MySql);
                }).Options;
            return new DbContextPool<HonestQDbContext>(options);
        });

        internal static HonestQDbContext CreateDbContext()
        {
            return honestQDbContextPool.Value.Rent();
        }
    }
}
