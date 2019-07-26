using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Tags
{
    public class TagsListModel
    {
        public TagsListModel() { }
        public TagsListModel(List<Tag> tags, List<int> watchingTagIds = null)
        {
            this.Tags = tags.Select(x =>
                new TagsListModel.TagListItemModel(x)
                {
                    Watching = watchingTagIds != null && watchingTagIds.Contains(x.Id)
                }).ToArray();
        }

        public TagListItemModel[] Tags { get; set; }

        public class TagListItemModel
        {
            public TagListItemModel() { }
            public TagListItemModel(Tag tag)
            {
                this.Slug = tag.Slug;
                this.Name = tag.Name;
            }

            [Required]
            public string Slug { get; set; }

            [Required]
            public string Name { get; set; }

            public bool Watching { get; set; }
        }
    }
}