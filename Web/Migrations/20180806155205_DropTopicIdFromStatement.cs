using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class DropTopicIdFromStatement : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Statement_Topic_TopicId",
                table: "Statement");

            migrationBuilder.DropIndex(
                name: "IX_Statement_TopicId",
                table: "Statement");

            migrationBuilder.DropColumn(
                name: "TopicId",
                table: "Statement");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TopicId",
                table: "Statement",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Statement_TopicId",
                table: "Statement",
                column: "TopicId");

            migrationBuilder.AddForeignKey(
                name: "FK_Statement_Topic_TopicId",
                table: "Statement",
                column: "TopicId",
                principalTable: "Topic",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
