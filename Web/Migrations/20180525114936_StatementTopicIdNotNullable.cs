using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Pobs.Web.Migrations
{
    public partial class StatementTopicIdNotNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Statement_Topic_TopicId",
                table: "Statement");

            migrationBuilder.AlterColumn<int>(
                name: "TopicId",
                table: "Statement",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Statement_Topic_TopicId",
                table: "Statement",
                column: "TopicId",
                principalTable: "Topic",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Statement_Topic_TopicId",
                table: "Statement");

            migrationBuilder.AlterColumn<int>(
                name: "TopicId",
                table: "Statement",
                nullable: true,
                oldClrType: typeof(int));

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
