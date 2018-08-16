using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FirstName = table.Column<string>(maxLength: 50, nullable: false),
                    LastName = table.Column<string>(maxLength: 50, nullable: false),
                    Username = table.Column<string>(maxLength: 50, nullable: false),
                    PasswordHash = table.Column<byte[]>(maxLength: 64, nullable: false),
                    PasswordSalt = table.Column<byte[]>(maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pop",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Slug = table.Column<string>(maxLength: 280, nullable: false),
                    Text = table.Column<string>(type: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL", maxLength: 280, nullable: false),
                    Source = table.Column<string>(type: "VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", maxLength: 2000, nullable: true),
                    PostedByUserId = table.Column<int>(nullable: false),
                    PostedAt = table.Column<DateTime>(nullable: false),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pop", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pop_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Topic",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Slug = table.Column<string>(maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL", maxLength: 100, nullable: false),
                    Summary = table.Column<string>(type: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", maxLength: 280, nullable: true),
                    MoreInfoUrl = table.Column<string>(maxLength: 2000, nullable: true),
                    PostedByUserId = table.Column<int>(nullable: false),
                    PostedAt = table.Column<DateTime>(nullable: false),
                    IsApproved = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Topic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Topic_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Text = table.Column<string>(type: "VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", maxLength: 280, nullable: true),
                    Source = table.Column<string>(type: "VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", maxLength: 2000, nullable: true),
                    AgreementRating = table.Column<int>(nullable: true),
                    PostedByUserId = table.Column<int>(nullable: false),
                    PostedAt = table.Column<DateTimeOffset>(nullable: false),
                    PopId = table.Column<int>(nullable: false),
                    ParentCommentId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comment_Comment_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comment_Pop_PopId",
                        column: x => x.PopId,
                        principalTable: "Pop",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comment_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PopTopic",
                columns: table => new
                {
                    PopId = table.Column<int>(nullable: false),
                    TopicId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PopTopic", x => new { x.PopId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_PopTopic_Pop_PopId",
                        column: x => x.PopId,
                        principalTable: "Pop",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PopTopic_Topic_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ParentCommentId",
                table: "Comment",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_PopId",
                table: "Comment",
                column: "PopId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_PostedByUserId",
                table: "Comment",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Pop_PostedByUserId",
                table: "Pop",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PopTopic_TopicId",
                table: "PopTopic",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Topic_PostedByUserId",
                table: "Topic",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Topic_Slug",
                table: "Topic",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Username",
                table: "User",
                column: "Username",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "PopTopic");

            migrationBuilder.DropTable(
                name: "Pop");

            migrationBuilder.DropTable(
                name: "Topic");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
