using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Pobs.Web.Migrations
{
    public partial class AddCommentTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    PostedAt = table.Column<DateTime>(nullable: false),
                    PostedByUserId = table.Column<int>(nullable: false),
                    StatementId = table.Column<int>(nullable: false),
                    Text = table.Column<string>(maxLength: 280, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comment_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_Statement_StatementId",
                        column: x => x.StatementId,
                        principalTable: "Statement",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_PostedByUserId",
                table: "Comment",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_StatementId",
                table: "Comment",
                column: "StatementId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comment");
        }
    }
}
