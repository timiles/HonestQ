namespace Pobs.Web.Models.Topics
{
    public class EditTopicFormModel
    {
        public string Slug { get; set; }
        public string Name { get; set; }
        public string Summary { get; set; }
        public string MoreInfoUrl { get; set; }
        public bool IsApproved { get; set; }
    }
}