using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class RenameStanceToType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stance",
                table: "Statement");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Statement",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Statement");

            migrationBuilder.AddColumn<int>(
                name: "Stance",
                table: "Statement",
                nullable: false,
                defaultValue: 0);
        }
    }
}
