namespace Pobs.Web.Models.Statements
{
    public class StatementFormModel
    {
        public string Text { get; set; }
        public string Source { get; set; }
        public string Stance { get; set; }
        public string[] TopicSlugs { get; set; }
    }
}