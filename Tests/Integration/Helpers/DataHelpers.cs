using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
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

        public static Topic CreateTopic(User statementUser, int numberOfStatements = 0, int numberOfStatementsPerStance = 0,
            User commentUser = null, int numberOfCommentsPerStatement = 0,
            User childCommentUser = null, int numberOfChildCommentsPerComment = 0,
            bool isApproved = true)
        {
            // Guarantee slug has both upper & lower case characters
            var name = "ABCabc" + Utils.GenerateRandomString(10);
            var topic = new Topic(name, name, statementUser, DateTime.UtcNow)
            {
                Summary = Utils.GenerateRandomString(50),
                MoreInfoUrl = Utils.GenerateRandomString(50),
                IsApproved = isApproved
            };

            var numberOfStances = Enum.GetValues(typeof(Stance)).Length;
            var numberOfStatementsToCreate = Math.Max(numberOfStatements, numberOfStatementsPerStance * numberOfStances);
            for (int s = 0; s < numberOfStatementsToCreate; s++)
            {
                var statement = new Statement(Utils.GenerateRandomString(10), statementUser, DateTime.UtcNow)
                {
                    Source = Utils.GenerateRandomString(10),
                    Stance = (Stance)(s % numberOfStances)
                };
                if (commentUser != null)
                {
                    for (int commentIndex = 0; commentIndex < numberOfCommentsPerStatement; commentIndex++)
                    {
                        var comment = new Comment(Utils.GenerateRandomString(10), commentUser, DateTime.UtcNow, AgreementRating.Neutral)
                        {
                            Source = Utils.GenerateRandomString(10)
                        };
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

            // Save everything first, then add child Comments by saved Ids. There's probably a better way but this works for now.
            if (childCommentUser != null && numberOfChildCommentsPerComment > 0)
            {
                using (var dbContext = TestSetup.CreateDbContext())
                {
                    dbContext.Attach(topic);
                    dbContext.Attach(childCommentUser);

                    foreach (var statement in topic.Statements)
                    {
                        foreach (var comment in statement.Comments.ToArray())
                        {
                            for (int childCommentIndex = 0; childCommentIndex < numberOfChildCommentsPerComment; childCommentIndex++)
                            {
                                var childComment = new Comment(Utils.GenerateRandomString(10), childCommentUser, DateTime.UtcNow, comment.Id)
                                {
                                    Source = Utils.GenerateRandomString(10),
                                };
                                statement.Comments.Add(childComment);
                            }
                        }
                    }

                    dbContext.SaveChanges();
                }
            }

            return topic;
        }

        /// <summary>Delete child comments before cascading other deletes so as to not upset foreign key constraints.</summary>
        public static void DeleteAllChildComments(int topicId)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                    .Include(x => x.Statements)
                        .ThenInclude(x => x.Comments)
                        .ThenInclude(x => x.ParentComment)
                    .Include(x => x.Statements)
                        .ThenInclude(x => x.Comments)
                        .ThenInclude(x => x.ChildComments)
                    .Single(x => x.Id == topicId);

                foreach (var statement in topic.Statements)
                {
                    foreach (var comment in statement.Comments.Where(x => x.ParentComment != null))
                    {
                        comment.ParentComment.ChildComments.Remove(comment);
                    }
                }
                dbContext.SaveChanges();
            }
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
