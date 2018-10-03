using System;
using System.Linq;

namespace Pobs.Web.Models.Activity
{
    public class ActivityListModel
    {
        public ActivityListModel() { }
        public ActivityListModel(ActivityListItemModel[] activityItems)
        {
            this.ActivityItems = activityItems;
            this.LastTimestamp = new DateTimeOffset(activityItems.Min(x => x.PostedAt)).ToUnixTimeMilliseconds();
        }

        public ActivityListItemModel[] ActivityItems { get; set; }
        public long LastTimestamp { get; set; }
    }
}