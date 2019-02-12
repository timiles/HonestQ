using System;
using Pobs.Comms;

namespace Pobs.Web.Helpers
{
    public class AppSettings : IEmailSenderConfig
    {
        public const string ProductionDomain = "www.honestq.com";
        public static Lazy<string> BuildNumber = new Lazy<string>(() => Environment.GetEnvironmentVariable("POBSWEB_BUILD_NUMBER"));

        public string Domain { get; set; }
        public string ExceptionlessApiKey { get; set; }
        public string Secret { get; set; }

        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
    }
}