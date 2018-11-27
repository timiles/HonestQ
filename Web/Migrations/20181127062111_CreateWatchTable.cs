using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CreateWatchTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Watch",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(nullable: false),
                    TagId = table.Column<int>(nullable: true),
                    QuestionId = table.Column<int>(nullable: true),
                    AnswerId = table.Column<int>(nullable: true),
                    CommentId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Watch", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Watch_Answer_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "Answer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Watch_Comment_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Watch_Question_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Question",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Watch_Tag_TagId",
                        column: x => x.TagId,
                        principalTable: "Tag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Watch_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Watch_AnswerId",
                table: "Watch",
                column: "AnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_Watch_CommentId",
                table: "Watch",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Watch_QuestionId",
                table: "Watch",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_Watch_TagId",
                table: "Watch",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Watch_UserId_AnswerId",
                table: "Watch",
                columns: new[] { "UserId", "AnswerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Watch_UserId_CommentId",
                table: "Watch",
                columns: new[] { "UserId", "CommentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Watch_UserId_QuestionId",
                table: "Watch",
                columns: new[] { "UserId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Watch_UserId_TagId",
                table: "Watch",
                columns: new[] { "UserId", "TagId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Watch");
        }
    }
}
