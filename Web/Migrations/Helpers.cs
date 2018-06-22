using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public static class Helpers
    {
        public static void ApplyUtf8mb4CharSet(this MigrationBuilder migrationBuilder, string table)
        {
            migrationBuilder.Sql($@"ALTER TABLE {table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        }

        public static void ApplyUtf8mb4CharSet(this MigrationBuilder migrationBuilder, string table, string column, int length)
        {
            migrationBuilder.Sql($@"ALTER TABLE {table} CHANGE {column} {column} VARCHAR({length}) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        }
    }
}