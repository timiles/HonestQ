using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CharSets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.Sql($@"ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

            migrationBuilder.ApplyUtf8mb4CharSet("Topic");
            migrationBuilder.ApplyUtf8mb4CharSet("Topic", "Name", 100, false);
            migrationBuilder.ApplyUtf8mb4CharSet("Topic", "Summary", 280, true);

            migrationBuilder.ApplyUtf8mb4CharSet("Pop");
            migrationBuilder.ApplyUtf8mb4CharSet("Pop", "Source", 100, true);
            migrationBuilder.ApplyUtf8mb4CharSet("Pop", "Text", 280, false);

            migrationBuilder.ApplyUtf8mb4CharSet("Comment");
            migrationBuilder.ApplyUtf8mb4CharSet("Comment", "Source", 100, true);
            migrationBuilder.ApplyUtf8mb4CharSet("Comment", "Text", 280, true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
