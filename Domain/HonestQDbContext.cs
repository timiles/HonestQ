using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Pobs.Domain.Entities;
using Pobs.Domain.QueryObjects;

namespace Pobs.Domain
{
    public class HonestQDbContext : DbContext
    {
        public HonestQDbContext(DbContextOptions<HonestQDbContext> options) : base(options)
        {
        }

        // Entities
        public DbSet<Notification> Notifications { get; set; }

        public DbSet<Question> Questions { get; set; }

        public DbSet<Tag> Tags { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Watch> Watches { get; set; }

        // Query objects
        public DbQuery<QuestionSearchResult> QuestionSearch { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Tables take DbSet property name by default. Let's stick to Entity name
                entityType.Relational().TableName = entityType.DisplayName();
            }

            // Unique contraints
            modelBuilder.Entity<Tag>().HasIndex(x => x.Slug).IsUnique();
            modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
            modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
            modelBuilder.Entity<Reaction>().HasIndex(x => new { x.AnswerId, x.PostedByUserId, x.Type }).IsUnique();
            modelBuilder.Entity<Reaction>().HasIndex(x => new { x.CommentId, x.PostedByUserId, x.Type }).IsUnique();
            modelBuilder.Entity<Watch>().HasIndex(x => new { x.UserId, x.TagId }).IsUnique();
            modelBuilder.Entity<Watch>().HasIndex(x => new { x.UserId, x.QuestionId }).IsUnique();
            modelBuilder.Entity<Watch>().HasIndex(x => new { x.UserId, x.AnswerId }).IsUnique();
            modelBuilder.Entity<Watch>().HasIndex(x => new { x.UserId, x.CommentId }).IsUnique();
            // NOTE: Question Slug could also be unique by TagId, but don't worry for now, we need far more clever de-duplication anyway

            // Emoji-enabled columns. TODO: can this be done by an Attribute? Also probably needs Database and Tables altered before Columns...
            modelBuilder.Entity<Tag>(x =>
            {
                x.Property(p => p.Name).HasCharSetForEmoji();
                x.Property(p => p.Description).HasCharSetForEmoji();
            });
            modelBuilder.Entity<Question>(x =>
            {
                x.Property(p => p.Text).HasCharSetForEmoji();
                x.Property(p => p.Source).HasCharSetForEmoji();
                x.Property(p => p.Context).HasCharSetForEmoji();
            });
            modelBuilder.Entity<Answer>(x =>
            {
                x.Property(p => p.Text).HasCharSetForEmoji();
            });
            modelBuilder.Entity<Comment>(x =>
            {
                x.Property(p => p.Text).HasCharSetForEmoji();
                x.Property(p => p.Source).HasCharSetForEmoji();
            });
            modelBuilder.Entity<User>(x =>
            {
                x.Property(p => p.Email).HasCharSetForEmoji();
                x.Property(p => p.Username).HasCharSetForEmoji();
            });

            // Cascade all the deletes
            modelBuilder.Entity<Comment>().HasOne(x => x.ParentComment).WithMany(x => x.ChildComments)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Notification>().HasOne(x => x.Answer).WithMany(x => x.Notifications)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Notification>().HasOne(x => x.Comment).WithMany(x => x.Notifications)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Notification>().HasOne(x => x.Question).WithMany(x => x.Notifications)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Reaction>().HasOne(x => x.Answer).WithMany(x => x.Reactions)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Reaction>().HasOne(x => x.Comment).WithMany(x => x.Reactions)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Watch>().HasOne(x => x.Answer).WithMany(x => x.Watches)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Watch>().HasOne(x => x.Comment).WithMany(x => x.Watches)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Watch>().HasOne(x => x.Question).WithMany(x => x.Watches)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;
            modelBuilder.Entity<Watch>().HasOne(x => x.Tag).WithMany(x => x.Watches)
                    .Metadata.DeleteBehavior = DeleteBehavior.Cascade;

            // Many-to-many relationships
            modelBuilder.Entity<QuestionTag>().HasKey(x => new { x.QuestionId, x.TagId });
            modelBuilder.Entity<QuestionTag>().HasOne(x => x.Question).WithMany(x => x.QuestionTags);
            modelBuilder.Entity<QuestionTag>().HasOne(x => x.Tag).WithMany(x => x.QuestionTags);

            // Full text indexes for searching
            modelBuilder.Entity<Question>().HasIndex(x => x.Text).ForMySqlIsFullText();
        }
    }
}