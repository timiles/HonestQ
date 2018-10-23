using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
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
                Name = "Bobby Tables",
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

        public static Topic CreateTopic(User user, bool isApproved = true, string topicNamePrefix = null, params Question[] questions)
        {
            // Guarantee slug has both upper & lower case characters
            topicNamePrefix = topicNamePrefix ?? "ABCabc";
            var name = topicNamePrefix + Utils.GenerateRandomString(10);
            var topic = new Topic(name, name, user, DateTime.UtcNow)
            {
                Summary = Utils.GenerateRandomString(50),
                MoreInfoUrl = Utils.GenerateRandomString(50),
                IsApproved = isApproved
            };

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(user);
                foreach (var question in questions)
                {
                    dbContext.Attach(question);
                    topic.Questions.Add(question);
                }
                dbContext.Topics.Add(topic);
                dbContext.SaveChanges();
            }

            return topic;
        }

        public static IEnumerable<Question> CreateQuestions(
            User questionUser, int numberOfQuestions = 1,
            User answerUser = null, int numberOfAnswersPerQuestion = 0)
        {
            var questions = new List<Question>();
            for (int questionIndex = 0; questionIndex < numberOfQuestions; questionIndex++)
            {
                // Stagger PostedAt times
                var questionPostedAt = DateTime.UtcNow.AddHours(-1.0 * (questionIndex + 1) / numberOfQuestions);
                var question = new Question(Utils.GenerateRandomString(10), questionUser, questionPostedAt)
                {
                    Source = Utils.GenerateRandomString(10),
                };
                if (answerUser != null)
                {
                    for (int answerIndex = 0; answerIndex < numberOfAnswersPerQuestion; answerIndex++)
                    {
                        // Stagger PostedAt times
                        var answerPostedAt = DateTime.UtcNow.AddHours(-1.0 * (answerIndex + 1) / numberOfAnswersPerQuestion);
                        var answer = new Answer(Utils.GenerateRandomString(10), answerUser, answerPostedAt)
                        {
                            Source = Utils.GenerateRandomString(10)
                        };
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

        public static IEnumerable<Comment> CreateComments(
            Answer answer, User commentUser, int numberOfComments, CommentStatus commentStatus = CommentStatus.OK)
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
            Comment comment, User commentUser, int numberOfComments, CommentStatus commentStatus = CommentStatus.OK)
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

        /// <summary>Delete comments before cascading other deletes so as to not upset foreign key constraints.</summary>
        public static void DeleteAllComments(int questionId)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var question = dbContext.Questions.Include(x => x.Answers).ThenInclude(x => x.Comments)
                    .First(x => x.Id == questionId);

                // Delete child comments first
                foreach (var answer in question.Answers)
                {
                    foreach (var comment in answer.Comments.Where(x => x.ParentComment != null))
                    {
                        comment.ParentComment.ChildComments.Remove(comment);
                    }
                }
                dbContext.SaveChanges();

                // Delete rest of the Comments
                foreach (var answer in question.Answers)
                {
                    foreach (var comment in answer.Comments.ToArray())
                    {
                        dbContext.Remove(comment);
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
