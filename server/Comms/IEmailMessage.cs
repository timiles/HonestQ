namespace Pobs.Comms
{
    public interface IEmailMessage
    {
        string From { get; }
        string Subject { get; }
        string BodyHtml { get; }
    }
}