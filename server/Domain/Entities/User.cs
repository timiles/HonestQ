using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class User
    {
        public User() { }
        public User(string username, DateTimeOffset createdAt)
        {
            Username = username;
            CreatedAt = createdAt;
        }

        public int Id { get; set; }

        [MaxLength(100)]
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

        public virtual ICollection<PushToken> PushTokens { get; set; }
    }
}