using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Pobs.Web.Migrations
{
    public partial class RenameOpinionToStatement : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Opinion");

            migrationBuilder.CreateTable(
                name: "Statement",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    PostedAt = table.Column<DateTime>(nullable: false),
                    PostedByUserId = table.Column<int>(nullable: false),
                    Text = table.Column<string>(maxLength: 280, nullable: false),
                    TopicId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Statement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Statement_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Statement_Topic_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Statement_PostedByUserId",
                table: "Statement",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Statement_TopicId",
                table: "Statement",
                column: "TopicId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Statement");

            migrationBuilder.CreateTable(
                name: "Opinion",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    PostedAt = table.Column<DateTime>(nullable: false),
                    PostedByUserId = table.Column<int>(nullable: false),
                    Text = table.Column<string>(maxLength: 280, nullable: false),
                    TopicId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opinion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Opinion_User_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Opinion_Topic_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opinion_PostedByUserId",
                table: "Opinion",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Opinion_TopicId",
                table: "Opinion",
                column: "TopicId");
        }
    }
}
