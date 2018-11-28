using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Questions;

namespace Pobs.Web.Models.Tags
{
    public class TagModel
    {
        public TagModel() { }
        public TagModel(Tag tag, int? loggedInUserId)
        {
            this.Slug = tag.Slug;
            this.Name = tag.Name;
            this.Description = tag.Description;
            this.MoreInfoUrl = tag.MoreInfoUrl;
            this.Questions = tag.Questions.Where(x => x.Status == PostStatus.OK).Select(x => new QuestionListItemModel(x)).ToArray();
            this.IsWatchedByLoggedInUser = tag.Watches.Any(x => x.UserId == loggedInUserId);
        }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string MoreInfoUrl { get; set; }

        public bool IsWatchedByLoggedInUser { get; set; }

        public QuestionListItemModel[] Questions { get; set; }
    }
}