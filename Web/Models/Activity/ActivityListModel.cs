using System.Linq;

namespace Pobs.Web.Models.Activity
{
    public class ActivityListModel
    {
        public ActivityListModel() { }
        public ActivityListModel(ActivityModel[] activities)
        {
            this.Activities = activities;
            this.LastTimestamp = activities.Min(x => x.PostedAt).ToUnixTimeMilliseconds();
        }

        public ActivityModel[] Activities { get; set; }
        public long LastTimestamp { get; set; }
    }
}