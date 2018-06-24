using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class SourceOnStatementAndComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Statement",
                maxLength: 100,
                nullable: true);

            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.ApplyUtf8mb4CharSet("Statement", "Source", 100, true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Comment",
                maxLength: 100,
                nullable: true);

            // TODO: see if this can be done through Pomelo conventions
            migrationBuilder.ApplyUtf8mb4CharSet("Comment", "Source", 100, true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Source",
                table: "Statement");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "Comment");
        }
    }
}
