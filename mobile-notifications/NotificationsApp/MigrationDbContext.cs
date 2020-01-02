using Pobs.MobileNotifications.Domain;

namespace Pobs.MobileNotifications.NotificationsApp
{
    public class MigrationDbContext : MobileNotificationsDbContext
    {
        public MigrationDbContext(string connectionString = "Server=localhost;Database=honestqnotifications_migrations;User=root;Password=poi123;")
            : base(connectionString)
        {
        }
    }
}
