using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Pobs.Domain.Entities;

namespace Pobs.Domain
{
    public class HonestQDbContext : DbContext
    {
        public HonestQDbContext(DbContextOptions<HonestQDbContext> options) : base(options)
        {
        }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<Question> Questions { get; set; }

        public DbSet<Tag> Tags { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Watch> Watches { get; set; }

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
            });
            modelBuilder.Entity<Answer>(x =>
            {
                x.Property(p => p.Text).HasCharSetForEmoji();
                x.Property(p => p.Source).HasCharSetForEmoji();
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

            // Don't cascade deletes from Collection to Parent
            modelBuilder.Entity<Answer>().HasOne(x => x.Question).WithMany(x => x.Answers)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Comment>().HasOne(x => x.Answer).WithMany(x => x.Comments)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Comment>().HasOne(x => x.ParentComment).WithMany(x => x.ChildComments)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Watch>().HasOne(x => x.User).WithMany(x => x.Watches)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;

            // Many-to-many relationships
            modelBuilder.Entity<QuestionTag>().HasKey(x => new { x.QuestionId, x.TagId });
            modelBuilder.Entity<QuestionTag>().HasOne(x => x.Question).WithMany(x => x.QuestionTags);
            modelBuilder.Entity<QuestionTag>().HasOne(x => x.Tag).WithMany(x => x.QuestionTags);
        }
    }
}