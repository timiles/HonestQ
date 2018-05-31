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

            // Unique contraints
            modelBuilder.Entity<Topic>().HasIndex(x => x.Slug).IsUnique();
            modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
            // NOTE: Statement Slug could also be unique by TopicId, but don't worry for now, we need far more clever de-duplication anyway

            // Don't cascase deletes from Collection to Parent
            modelBuilder.Entity<Statement>().HasOne(x => x.Topic).WithMany(x => x.Statements)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Comment>().HasOne(x => x.Statement).WithMany(x => x.Comments)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }
}