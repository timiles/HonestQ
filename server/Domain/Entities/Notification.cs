using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Notification
    {
        public long Id { get; set; }

        public int OwnerUserId { get; set; }
        [Required]
        public User OwnerUser { get; set; }

        public bool Seen { get; set; }

        public Question Question { get; set; }
        public Answer Answer { get; set; }
        public Comment Comment { get; set; }
    }
}