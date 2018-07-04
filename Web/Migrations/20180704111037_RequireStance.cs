using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class RequireStance : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stance",
                table: "Statement");

            migrationBuilder.AddColumn<int>(
                name: "Stance",
                table: "Statement",
                nullable: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stance",
                table: "Statement");
        }
    }
}
