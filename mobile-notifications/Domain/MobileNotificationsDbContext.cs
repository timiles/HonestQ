using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Pobs.MobileNotifications.Domain.Entities;

namespace Pobs.MobileNotifications.Domain
{
    public class MobileNotificationsDbContext : DbContext
    {
        public MobileNotificationsDbContext(string connectionString) : base(DefaultDbContextOptionsBuilder.Build(connectionString))
        {
        }

        // Entities
        public DbSet<Run> Runs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Tables take DbSet property name by default. Let's stick to Entity name
                entityType.Relational().TableName = entityType.DisplayName();
            }

            modelBuilder.Entity<Run>().Property(e => e.Type).HasConversion(new EnumToStringConverter<RunType>());
        }
    }
}
