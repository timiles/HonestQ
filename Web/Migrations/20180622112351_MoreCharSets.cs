using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class MoreCharSets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.ApplyUtf8mb4CharSet("Topic");
            migrationBuilder.ApplyUtf8mb4CharSet("Topic", "Name", 100);
            migrationBuilder.ApplyUtf8mb4CharSet("Topic", "Summary", 280);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
