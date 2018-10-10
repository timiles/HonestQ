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

        public DbSet<Question> Questions { get; set; }

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
            modelBuilder.Entity<Reaction>().HasIndex(x => new { x.CommentId, x.PostedByUserId, x.Type }).IsUnique();
            // NOTE: Question Slug could also be unique by TopicId, but don't worry for now, we need far more clever de-duplication anyway

            // Emoji-enabled columns. TODO: can this be done by an Attribute? Also probably needs Database and Tables altered before Columns...
            modelBuilder.Entity<Topic>(x =>
            {
                x.Property(p => p.Name).HasCharSetForEmoji();
                x.Property(p => p.Summary).HasCharSetForEmoji();
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

            // Don't cascade deletes from Collection to Parent
            modelBuilder.Entity<Answer>().HasOne(x => x.Question).WithMany(x => x.Answers)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Comment>().HasOne(x => x.Answer).WithMany(x => x.Comments)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;
            modelBuilder.Entity<Comment>().HasOne(x => x.ParentComment).WithMany(x => x.ChildComments)
                .Metadata.DeleteBehavior = DeleteBehavior.Restrict;

            // Many-to-many relationships
            modelBuilder.Entity<QuestionTopic>().HasKey(x => new { x.QuestionId, x.TopicId });
            modelBuilder.Entity<QuestionTopic>().HasOne(x => x.Question).WithMany(x => x.QuestionTopics);
            modelBuilder.Entity<QuestionTopic>().HasOne(x => x.Topic).WithMany(x => x.QuestionTopics);
        }
    }
}