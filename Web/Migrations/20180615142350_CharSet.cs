using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CharSet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.Sql($@"ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            migrationBuilder.Sql($@"ALTER TABLE Statement CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            migrationBuilder.Sql($@"ALTER TABLE Statement CHANGE Text Text VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            migrationBuilder.Sql($@"ALTER TABLE Comment CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            migrationBuilder.Sql($@"ALTER TABLE Comment CHANGE Text Text VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
