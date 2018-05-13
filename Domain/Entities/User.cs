using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pobs.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, MaxLength(50)]
        public string Username { get; set; }

        [Required, MaxLength(64)]
        public byte[] PasswordHash { get; set; }

        [Required, MaxLength(128)]
        public byte[] PasswordSalt { get; set; }


        public virtual ICollection<Topic> Topics { get; set; }
    }
}