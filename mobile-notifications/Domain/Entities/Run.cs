using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Pobs.MobileNotifications.Domain.Entities
{
    public class Run
    {
        public Run()
        {
            this.PushedNotifications = new Collection<PushedNotification>();
        }

        public long Id { get; set; }

        [MaxLength(20)]
        public RunType Type { get; set; }

        public DateTimeOffset StartedAt { get; set; }

        public DateTimeOffset? FinishedAt { get; set; }

        public ICollection<PushedNotification> PushedNotifications { get; set; }
    }
}