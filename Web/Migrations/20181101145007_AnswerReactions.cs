using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class AnswerReactions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction");

            migrationBuilder.AlterColumn<long>(
                name: "CommentId",
                table: "Reaction",
                nullable: true,
                oldClrType: typeof(long));

            migrationBuilder.AddColumn<int>(
                name: "AnswerId",
                table: "Reaction",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reaction_AnswerId_PostedByUserId_Type",
                table: "Reaction",
                columns: new[] { "AnswerId", "PostedByUserId", "Type" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction");

            migrationBuilder.DropIndex(
                name: "IX_Reaction_AnswerId_PostedByUserId_Type",
                table: "Reaction");

            migrationBuilder.DropColumn(
                name: "AnswerId",
                table: "Reaction");

            migrationBuilder.AlterColumn<long>(
                name: "CommentId",
                table: "Reaction",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
