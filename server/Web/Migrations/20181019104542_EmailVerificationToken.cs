﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class EmailVerificationToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationToken",
                table: "User",
                maxLength: 32,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerificationToken",
                table: "User");
        }
    }
}
