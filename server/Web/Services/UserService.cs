using System.Collections.Generic;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Helpers;

namespace Pobs.Web.Services
{
    public interface IUserService
    {
        User Authenticate(string username, string password);
        IEnumerable<User> GetAll();
        User GetById(int id);
        User Create(User user, string password);
        void Update(User user, string password = null);
        void Delete(int id);
    }

    public class UserService : IUserService
    {
        private HonestQDbContext _context;

        public UserService(HonestQDbContext context)
        {
            _context = context;
        }

        public User Authenticate(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return null;

            var user = _context.Users.SingleOrDefault(x => x.Username == username);

            // check if username exists
            if (user == null)
                return null;

            // check if password is correct
            if (!AuthUtils.VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                return null;

            // authentication successful
            return user;
        }

        public IEnumerable<User> GetAll()
        {
            return _context.Users;
        }

        public User GetById(int id)
        {
            return _context.Users.Find(id);
        }

        public User Create(User user, string password)
        {
            // validation
            if (string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is required.");

            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException($"Username '{user.Username}' is already taken.");

            if (!string.IsNullOrWhiteSpace(user.Email) && _context.Users.Any(x => x.Email == user.Email))
                throw new AppException($"An account already exists for '{user.Email}'.");

            (byte[] passwordSalt, byte[] passwordHash) = AuthUtils.CreatePasswordHash(password);

            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;

            _context.Users.Add(user);
            _context.SaveChanges();

            return user;
        }

        public void Update(User user, string password = null)
        {
            var existingUser = _context.Users.Find(user.Id);

            if (existingUser == null)
                throw new AppException("User not found.");

            if (user.Username != existingUser.Username)
            {
                // Username has changed so check if the new username is already taken
                if (_context.Users.Any(x => x.Username == user.Username))
                    throw new AppException($"Username '{user.Username}' is already taken.");
            }

            // Update user properties
            existingUser.Email = user.Email;
            existingUser.Username = user.Username;

            // Update password if it was entered
            if (!string.IsNullOrWhiteSpace(password))
            {
                (byte[] passwordSalt, byte[] passwordHash) = AuthUtils.CreatePasswordHash(password);

                existingUser.PasswordSalt = passwordSalt;
                existingUser.PasswordHash = passwordHash;
            }

            _context.Users.Update(existingUser);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }
    }
}