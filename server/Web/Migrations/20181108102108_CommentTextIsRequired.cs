using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CommentTextIsRequired : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Text",
                table: "Comment",
                type: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL",
                maxLength: 280,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
                oldMaxLength: 280,
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Text",
                table: "Comment",
                type: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
                maxLength: 280,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL",
                oldMaxLength: 280);
        }
    }
}
