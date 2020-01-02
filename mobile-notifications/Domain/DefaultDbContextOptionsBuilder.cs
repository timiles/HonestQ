using System;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace Pobs.MobileNotifications.Domain
{
    public class DefaultDbContextOptionsBuilder
    {
        public static DbContextOptions Build(string connectionString)
        {
            return new DbContextOptionsBuilder().UseMySql(connectionString,
                    b =>
                    {
                        b.ServerVersion(new Version(5, 7, 21), ServerType.MySql);
                        b.CharSetBehavior(CharSetBehavior.AppendToAllAnsiColumns);
                        b.AnsiCharSet(CharSet.Latin1);
                        b.UnicodeCharSet(CharSet.Utf8mb4);
                    }).Options;
        }
    }
}
