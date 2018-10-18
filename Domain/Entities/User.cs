using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pobs.Domain.Entities
{
    public class User
    {
        public User() { }
        public User(string name, string email, string username, DateTimeOffset createdAt)
        {
            Name = name;
            Email = email;
            Username = username;
            CreatedAt = createdAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; }

        [Required, MaxLength(64)]
        public byte[] PasswordHash { get; set; }

        [Required, MaxLength(128)]
        public byte[] PasswordSalt { get; set; }

        public DateTimeOffset CreatedAt { get; set; }


        public virtual ICollection<Topic> Topics { get; set; }
    }
}