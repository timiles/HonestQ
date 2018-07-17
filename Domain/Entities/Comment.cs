using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Pobs.Domain.Entities
{
    public class Comment
    {
        public Comment() { }
        protected Comment(string text, User postedByUser, DateTimeOffset postedAt)
        {
            Text = text;
            PostedByUser = postedByUser;
            PostedAt = postedAt;
            ChildComments = new Collection<Comment>();
        }
        public Comment(string text, User postedByUser, DateTimeOffset postedAt, AgreementRating agreementRating)
            : this(text, postedByUser, postedAt)
        {
            AgreementRating = agreementRating;
        }
        public Comment(string text, User postedByUser, DateTimeOffset postedAt, long parentCommentId)
            : this(text, postedByUser, postedAt)
        {
            ParentComment = new Comment { Id = parentCommentId };
        }

        public long Id { get; set; }


        [MaxLength(280)]
        public string Text { get; set; }

        [MaxLength(2000)]
        public string Source { get; set; }

        public AgreementRating? AgreementRating { get; set; }

        [Required]
        public User PostedByUser { get; set; }

        public DateTimeOffset PostedAt { get; set; }


        [Required]
        public virtual Statement Statement { get; set; }

        public virtual Comment ParentComment { get; set; }
        public virtual ICollection<Comment> ChildComments { get; set; }
    }
}
