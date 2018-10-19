namespace Pobs.Comms
{
    public interface IEmailSenderConfig
    {
        string SmtpUsername { get; }
        string SmtpPassword { get; }
        string SmtpHost { get; }
        int SmtpPort { get; }
    }
}