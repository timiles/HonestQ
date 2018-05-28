using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Pobs.Web.Migrations
{
    public partial class RenameUrlFragmentToSlug : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UrlFragment",
                table: "Topic",
                newName: "Slug");

            migrationBuilder.RenameIndex(
                name: "IX_Topic_UrlFragment",
                table: "Topic",
                newName: "IX_Topic_Slug");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Slug",
                table: "Topic",
                newName: "UrlFragment");

            migrationBuilder.RenameIndex(
                name: "IX_Topic_Slug",
                table: "Topic",
                newName: "IX_Topic_UrlFragment");
        }
    }
}
