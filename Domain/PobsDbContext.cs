using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Pobs.Domain.Entities;

namespace Pobs.Domain
{
    public class PobsDbContext : DbContext
    {
        public PobsDbContext(DbContextOptions<PobsDbContext> options) : base(options)
        {
        }

        public DbSet<Topic> Topics { get; set; }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Tables take DbSet property name by default. Let's stick to Entity name
                entityType.Relational().TableName = entityType.DisplayName();
            }

            modelBuilder.Entity<Topic>().HasIndex(x => x.UrlFragment).IsUnique();
            modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();

            // Don't cascase deletes from Statement to Topic
            modelBuilder.Entity<Statement>().HasOne(x => x.Topic).WithMany(x => x.Statements)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }
}