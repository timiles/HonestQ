namespace Pobs.Comms
{
    internal class TagAwaitingApprovalEmailMessage : IEmailMessage
    {
        private readonly string _tagSlug;
        private readonly string _tagName;

        internal TagAwaitingApprovalEmailMessage(string tagSlug, string tagName)
        {
            _tagSlug = tagSlug;
            _tagName = tagName;
        }

        public string From => "noreply@honestq.com";

        public string Subject => $"Tag awaiting approval!";

        public string BodyHtml => $@"<h1>Tag awaiting approval!</h1>
<p>{_tagName}</p>
<p><a href=""https://www.honestq.com/admin/edit/tags/{_tagSlug}"">Link</a></p>";

    }
}