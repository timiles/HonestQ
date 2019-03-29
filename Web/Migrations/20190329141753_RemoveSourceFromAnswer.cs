using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class RemoveSourceFromAnswer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Source",
                table: "Answer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Answer",
                type: "VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
                maxLength: 2000,
                nullable: true);
        }
    }
}
