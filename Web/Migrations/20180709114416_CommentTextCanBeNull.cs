using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CommentTextCanBeNull : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Text",
                table: "Comment",
                maxLength: 280,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 280);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Text",
                table: "Comment",
                maxLength: 280,
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 280,
                oldNullable: true);
        }
    }
}
