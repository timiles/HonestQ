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

        public static Topic CreateTopic(
            User questionUser, int numberOfQuestions = 0,
            User answerUser = null, int numberOfAnswersPerQuestion = 0,
            bool isApproved = true, string topicNamePrefix = null)
        {
            // Guarantee slug has both upper & lower case characters
            topicNamePrefix = topicNamePrefix ?? "ABCabc";
            var name = topicNamePrefix + Utils.GenerateRandomString(10);
            var topic = new Topic(name, name, questionUser, DateTime.UtcNow)
            {
                Summary = Utils.GenerateRandomString(50),
                MoreInfoUrl = Utils.GenerateRandomString(50),
                IsApproved = isApproved
            };

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
                topic.Questions.Add(question);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(questionUser);
                if (answerUser != null)
                {
                    dbContext.Attach(answerUser);
                }
                dbContext.Topics.Add(topic);
                dbContext.SaveChanges();
            }

            return topic;
        }

        public static void CreateComments(Answer answer, User commentUser, int numberOfComments)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(answer);
                dbContext.Attach(commentUser);
                for (var i = 0; i < numberOfComments; i++)
                {
                    // Stagger PostedAt times
                    var postedAt = DateTime.UtcNow.AddHours(-1.0 * (i + 1) / numberOfComments);
                    answer.Comments.Add(new Comment(Utils.GenerateRandomString(10), commentUser, postedAt, AgreementRating.Agree, null));
                }
                dbContext.SaveChanges();
            }
        }

        /// <summary>Delete comments before cascading other deletes so as to not upset foreign key constraints.</summary>
        public static void DeleteAllComments(int topicId)
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                var topic = dbContext.Topics
                    .Include(x => x.QuestionTopics).ThenInclude(x => x.Question).ThenInclude(x => x.Answers).ThenInclude(x => x.Comments)
                    .First(x => x.Id == topicId);

                // Delete child comments first
                foreach (var question in topic.Questions)
                {
                    foreach (var answer in question.Answers)
                    {
                        foreach (var comment in answer.Comments.Where(x => x.ParentComment != null))
                        {
                            comment.ParentComment.ChildComments.Remove(comment);
                        }
                    }
                }
                dbContext.SaveChanges();

                // Delete rest of the Comments
                foreach (var question in topic.Questions)
                {
                    foreach (var answer in question.Answers)
                    {
                        foreach (var comment in answer.Comments.ToArray())
                        {
                            dbContext.Remove(comment);
                        }
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
