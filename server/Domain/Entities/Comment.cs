using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Comment : IHasWatches
    {
        public Comment()
        {
            this.ChildComments = new Collection<Comment>();
            this.Reactions = new Collection<Reaction>();
            this.Watches = new Collection<Watch>();
        }
        public Comment(string text, User postedByUser, DateTimeOffset postedAt, AgreementRating agreementRating, long? parentCommentId)
            : this()
        {
            this.Text = text;
            this.PostedByUser = postedByUser;
            this.PostedAt = postedAt;
            this.AgreementRating = agreementRating;
            if (parentCommentId.HasValue)
            {
                this.ParentComment = new Comment { Id = parentCommentId.Value };
            }
        }

        public long Id { get; set; }


        [Required, MaxLength(280)]
        public string Text { get; set; }

        [MaxLength(2000)]
        public string Source { get; set; }

        public AgreementRating AgreementRating { get; set; }

        [Required]
        public User PostedByUser { get; set; }
        public int PostedByUserId { get; set; }

        public DateTimeOffset PostedAt { get; set; }

        public bool IsAnonymous { get; set; }
        public PostStatus Status { get; set; }

        [Required]
        public virtual Answer Answer { get; set; }

        public virtual Comment ParentComment { get; set; }
        public virtual ICollection<Comment> ChildComments { get; set; }
        public virtual ICollection<Reaction> Reactions { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Watch> Watches { get; set; }
    }
}
