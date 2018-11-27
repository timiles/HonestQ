using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Notifications
{
    public class WatchResponseModel
    {
        public WatchResponseModel() { }
        private WatchResponseModel(WatchType type, string identifier, IEnumerable<Watch> watches, int loggedInUserId)
        {
            this.Type = type.ToString();
            this.Identifier = identifier;
            this.NewCount = watches.Count();
            this.IsWatchedByLoggedInUser = watches.Any(x => x.UserId == loggedInUserId);
        }

        public WatchResponseModel(Answer answer, int loggedInUserId)
        : this(WatchType.Answer, $"{answer.Question.Id}|{answer.Id}", answer.Watches, loggedInUserId) { }
        public WatchResponseModel(Comment comment, int loggedInUserId)
        : this(WatchType.Comment, $"{comment.Answer.Question.Id}|{comment.Answer.Id}|{comment.Id}", comment.Watches, loggedInUserId) { }
        public WatchResponseModel(Question question, int loggedInUserId)
        : this(WatchType.Question, question.Id.ToString(), question.Watches, loggedInUserId) { }
        public WatchResponseModel(Tag tag, int loggedInUserId)
        : this(WatchType.Tag, tag.Slug, tag.Watches, loggedInUserId) { }

        [Required]
        public string Type { get; set; }

        [Required]
        public string Identifier { get; set; }

        public int NewCount { get; set; }

        public bool IsWatchedByLoggedInUser { get; set; }
    }
}