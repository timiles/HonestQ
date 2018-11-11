using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Tags
{
    public class AdminTagModel : TagModel
    {
        public AdminTagModel() : base() { }
        public AdminTagModel(Tag tag) : base(tag)
        {
            this.IsApproved = tag.IsApproved;
        }

        public bool IsApproved { get; set; }
    }
}