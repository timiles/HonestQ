using System;
using System.Collections.Generic;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;

namespace Pobs.Tests.Integration.Helpers
{
    internal static class DataHelpers
    {
        public static User CreateUser()
        {
            var user = new User
            {
                Email = Utils.GenerateRandomString(10) + "@example.com",
                Username = Utils.GenerateRandomString(10),
                PasswordSalt = new byte[0],
                PasswordHash = new byte[0],
            };

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Users.Add(user);
                dbContext.SaveChanges();
            }

            return user;
        }

        public static Tag CreateTag(User user, bool isApproved = true, string tagNamePrefix = null, params Question[] questions)
        {
            // Guarantee slug has both upper & lower case characters
            tagNamePrefix = tagNamePrefix ?? "ABCabc";
            var name = tagNamePrefix + Utils.GenerateRandomString(10);
            var tag = new Tag(name, name, user, DateTime.UtcNow)
            {
                Description = Utils.GenerateRandomString(50),
                MoreInfoUrl = Utils.GenerateRandomString(50),
                IsApproved = isApproved
            };

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(user);
                foreach (var question in questions)
                {
                    dbContext.Attach(question);
                    tag.Questions.Add(question);
                }
                dbContext.Tags.Add(tag);
                dbContext.SaveChanges();
            }

            return tag;
        }

        public static IEnumerable<Question> CreateQuestions(
            User questionUser, int numberOfQuestions = 1,
            User answerUser = null, int numberOfAnswersPerQuestion = 0,
            PostStatus questionStatus = PostStatus.OK)
        {
            var questions = new List<Question>();
            for (int questionIndex = 0; questionIndex < numberOfQuestions; questionIndex++)
            {
                // Stagger PostedAt times
                var questionPostedAt = DateTime.UtcNow.AddHours(-1.0 * (questionIndex + 1) / numberOfQuestions);
                // 3 random words for the Question text
                var questionText = $"{Utils.GenerateRandomString(4)} {Utils.GenerateRandomString(4)} {Utils.GenerateRandomString(4)}";
                var question = new Question(questionText, questionUser, questionPostedAt)
                {
                    Context = Utils.GenerateRandomString(10),
                    Status = questionStatus,
                };
                if (answerUser != null)
                {
                    for (int answerIndex = 0; answerIndex < numberOfAnswersPerQuestion; answerIndex++)
                    {
                        // Stagger PostedAt times
                        var answerPostedAt = DateTime.UtcNow.AddHours(-1.0 * (answerIndex + 1) / numberOfAnswersPerQuestion);
                        var answer = new Answer(Utils.GenerateRandomString(10), answerUser, answerPostedAt);
                        question.Answers.Add(answer);
                    }
                }
                questions.Add(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(questionUser);
                if (answerUser != null)
                {
                    dbContext.Attach(answerUser);
                }
                dbContext.Questions.AddRange(questions);
                dbContext.SaveChanges();
            }

            return questions;
        }

        public static void CreatePushToken(string token, int? userId)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.PushTokens.Add(new PushToken(token) { UserId = userId });
                dbContext.SaveChanges();
            }
        }

        public static IEnumerable<Comment> CreateComments(
            Answer answer, User commentUser, int numberOfComments, PostStatus commentStatus = PostStatus.OK)
        {
            var newComments = new List<Comment>();
            for (var i = 0; i < numberOfComments; i++)
            {
                // Stagger PostedAt times
                var postedAt = DateTime.UtcNow.AddHours(-1.0 * (i + 1) / numberOfComments);
                newComments.Add(new Comment(Utils.GenerateRandomString(10), commentUser, postedAt, AgreementRating.Agree, null)
                {
                    Status = commentStatus
                });
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(answer);
                dbContext.Attach(commentUser);
                foreach (var comment in newComments)
                {
                    answer.Comments.Add(comment);
                }
                dbContext.SaveChanges();
            }

            return newComments;
        }

        public static IEnumerable<Comment> CreateChildComments(
            Comment comment, User commentUser, int numberOfComments, PostStatus commentStatus = PostStatus.OK)
        {
            var newChildComments = new List<Comment>();
            for (var i = 0; i < numberOfComments; i++)
            {
                // Stagger PostedAt times
                var postedAt = DateTime.UtcNow.AddHours(-1.0 * (i + 1) / numberOfComments);
                newChildComments.Add(new Comment(Utils.GenerateRandomString(10), commentUser, postedAt, AgreementRating.Agree, null)
                {
                    Status = commentStatus,
                    ParentComment = comment,
                });
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(comment);
                dbContext.Attach(commentUser);
                foreach (var childComment in newChildComments)
                {
                    comment.Answer.Comments.Add(childComment);
                }
                dbContext.SaveChanges();
            }

            return newChildComments;
        }

        public static void CreateWatch(int userId, IHasWatches hasWatches)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(hasWatches);
                hasWatches.Watches.Add(new Watch(userId));
                dbContext.SaveChanges();
            }
        }

        public static IEnumerable<Notification> CreateNotifications(User notificationOwnerUser,
            Question question = null, Answer answer = null, Comment comment = null, Comment childComment = null)
        {
            var notifications = new List<Notification>();

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(notificationOwnerUser);
                if (question != null)
                {
                    dbContext.Attach(question);
                    notifications.Add(new Notification
                    {
                        OwnerUser = notificationOwnerUser,
                        Question = question,
                    });
                }
                if (answer != null)
                {
                    dbContext.Attach(answer);
                    notifications.Add(new Notification
                    {
                        OwnerUser = notificationOwnerUser,
                        Answer = answer,
                    });
                }
                if (comment != null)
                {
                    dbContext.Attach(comment);
                    notifications.Add(new Notification
                    {
                        OwnerUser = notificationOwnerUser,
                        Comment = comment,
                    });
                }
                if (childComment != null)
                {
                    dbContext.Attach(childComment);
                    notifications.Add(new Notification
                    {
                        OwnerUser = notificationOwnerUser,
                        Comment = childComment,
                    });
                }

                dbContext.Notifications.AddRange(notifications);
                dbContext.SaveChanges();
            }

            return notifications;
        }

        public static Comment UpvoteComment(Comment comment, int postedByUserId)
        {
            if (!comment.Reactions.Any(x => x.PostedByUserId == postedByUserId && x.Type == ReactionType.Upvote))
            {
                using (var dbContext = TestSetup.CreateDbContext())
                {
                    dbContext.Attach(comment);
                    comment.Reactions.Add(new Reaction(ReactionType.Upvote, postedByUserId, DateTimeOffset.UtcNow));
                    dbContext.SaveChanges();
                }
            }

            return comment;
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

        public static bool DeletePushToken(string token)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var pushToken = dbContext.PushTokens.Find(token);
                if (pushToken != null)
                {
                    dbContext.PushTokens.Remove(pushToken);
                    dbContext.SaveChanges();
                    return true;
                }
            }
            return false;
        }
    }
}
