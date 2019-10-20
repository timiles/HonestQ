using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class PushTokenCascadeDelete : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PushToken_User_UserId",
                table: "PushToken");

            migrationBuilder.AddForeignKey(
                name: "FK_PushToken_User_UserId",
                table: "PushToken",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PushToken_User_UserId",
                table: "PushToken");

            migrationBuilder.AddForeignKey(
                name: "FK_PushToken_User_UserId",
                table: "PushToken",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
