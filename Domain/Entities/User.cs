using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pobs.Domain.Entities
{
    public class User
    {
        public User() { }
        public User(string email, string username, DateTimeOffset createdAt)
        {
            Email = email;
            Username = username;
            CreatedAt = createdAt;
        }

        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; }

        [Required, MaxLength(64)]
        public byte[] PasswordHash { get; set; }

        [Required, MaxLength(128)]
        public byte[] PasswordSalt { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        [MaxLength(32)]
        public string EmailVerificationToken { get; set; }

        public virtual ICollection<Tag> Tags { get; set; }

        // This is only here to enable restricting cascade deletes from Watch to User
        public virtual ICollection<Watch> Watches { get; set; }
    }
}