using System;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Tests.Integration.Helpers
{
    static class DataHelpers
    {
        public static User CreateUser()
        {
            var user = new User
            {
                FirstName = "First name",
                LastName = "Last name",
                Username = Utils.GenerateRandomString(10),
                PasswordSalt = new byte[0],
                PasswordHash = new byte[0]
            };

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Users.Add(user);
                dbContext.SaveChanges();
            }

            return user;
        }

        public static Topic CreateTopic(User statementUser, int numberOfStatements = 0,
            User commentUser = null, int numberOfCommentsPerStatement = 0)
        {
            // Guarantee slug has both upper & lower case characters
            var name = "ABCabc" + Utils.GenerateRandomString(10);
            var topic = new Topic(name, name, statementUser, DateTime.UtcNow);

            for (int s = 0; s < numberOfStatements; s++)
            {
                var statement = new Statement(Utils.GenerateRandomString(10), statementUser, DateTime.UtcNow);
                if (commentUser != null)
                {
                    for (int c = 0; c < numberOfCommentsPerStatement; c++)
                    {
                        var comment = new Comment(Utils.GenerateRandomString(10), AgreementRating.Neutral, commentUser, DateTime.UtcNow);
                        statement.Comments.Add(comment);
                    }
                }
                topic.Statements.Add(statement);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(statementUser);
                if (commentUser != null)
                {
                    dbContext.Attach(commentUser);
                }
                dbContext.Topics.Add(topic);
                dbContext.SaveChanges();
            }

            return topic;
        }

        public static bool DeleteUser(int id)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var user = dbContext.Users.Find(id);
                if (user != null)
                {
                    dbContext.Users.Remove(user);
                    dbContext.SaveChanges();
                    return true;
                }
            }
            return false;
        }
    }
}
