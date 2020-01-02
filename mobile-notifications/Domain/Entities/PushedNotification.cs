using System;
using System.ComponentModel.DataAnnotations;

namespace Pobs.MobileNotifications.Domain.Entities
{
    public class PushedNotification
    {
        public long Id { get; set; }

        public long NotificationId { get; set; }

        [Required, StringLength(2000)]
        public string PushToken { get; set; }

        public DateTimeOffset SentAt { get; set; }

        [Required, MaxLength(50)]
        public string Status { get; set; }

        public Guid? ExpoId { get; set; }

        [MaxLength(1000)]
        public string Message { get; set; }

        [MaxLength(50)]
        public string Error { get; set; }
    }
}