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

        public static Topic CreateTopic(User popUser, int numberOfPops = 0, int numberOfPopsPerType = 0,
            User commentUser = null, int numberOfCommentsPerPop = 0,
            User childCommentUser = null, int numberOfChildCommentsPerComment = 0,
            bool isApproved = true, string topicNamePrefix = null)
        {
            // Guarantee slug has both upper & lower case characters
            topicNamePrefix = topicNamePrefix ?? "ABCabc";
            var name = topicNamePrefix + Utils.GenerateRandomString(10);
            var topic = new Topic(name, name, popUser, DateTime.UtcNow)
            {
                Summary = Utils.GenerateRandomString(50),
                MoreInfoUrl = Utils.GenerateRandomString(50),
                IsApproved = isApproved
            };

            var numberOfPopTypes = Enum.GetValues(typeof(PopType)).Length;
            var numberOfPopsToCreate = Math.Max(numberOfPops, numberOfPopsPerType * numberOfPopTypes);
            for (int s = 0; s < numberOfPopsToCreate; s++)
            {
                var type = (PopType)(s % numberOfPopTypes);
                var pop = new Pop(Utils.GenerateRandomString(10), popUser, DateTime.UtcNow, type)
                {
                    Source = Utils.GenerateRandomString(10),
                };
                if (commentUser != null)
                {
                    for (int commentIndex = 0; commentIndex < numberOfCommentsPerPop; commentIndex++)
                    {
                        var comment = new Comment(Utils.GenerateRandomString(10), commentUser, DateTime.UtcNow, AgreementRating.Neutral)
                        {
                            Source = Utils.GenerateRandomString(10)
                        };
                        pop.Comments.Add(comment);
                    }
                }
                topic.AddPop(pop, pop.Type == PopType.Statement ? Stance.Neutral : null as Stance?);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(popUser);
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

                    foreach (var pop in topic.Pops)
                    {
                        foreach (var comment in pop.Comments.ToArray())
                        {
                            for (int childCommentIndex = 0; childCommentIndex < numberOfChildCommentsPerComment; childCommentIndex++)
                            {
                                var childComment = new Comment(Utils.GenerateRandomString(10), childCommentUser, DateTime.UtcNow, comment.Id)
                                {
                                    Source = Utils.GenerateRandomString(10),
                                };
                                pop.Comments.Add(childComment);
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
                var topic = dbContext.Topics.Find(topicId);
                foreach (var pop in topic.Pops)
                {
                    foreach (var comment in pop.Comments.Where(x => x.ParentComment != null))
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
