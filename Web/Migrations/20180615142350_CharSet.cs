using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CharSet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.Sql($@"ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            migrationBuilder.ApplyUtf8mb4CharSet("Statement");
            migrationBuilder.ApplyUtf8mb4CharSet("Statement", "Text", 280);
            migrationBuilder.ApplyUtf8mb4CharSet("Comment");
            migrationBuilder.ApplyUtf8mb4CharSet("Comment", "Text", 280);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
