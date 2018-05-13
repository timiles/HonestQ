using System;
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
