using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class FixNullabilityOnColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.ApplyUtf8mb4CharSet("Topic", "Name", 100, false);
            migrationBuilder.ApplyUtf8mb4CharSet("Statement", "Text", 280, false);
            migrationBuilder.ApplyUtf8mb4CharSet("Comment", "Text", 280, false);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
