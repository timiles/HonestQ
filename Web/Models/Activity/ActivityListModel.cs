namespace Pobs.Web.Models.Activity
{
    public class ActivityListModel
    {
        public ActivityListModel() { }
        public ActivityListModel(ActivityModel[] activities)
        {
            this.Activities = activities;
        }

        public ActivityModel[] Activities { get; set; }
    }
}