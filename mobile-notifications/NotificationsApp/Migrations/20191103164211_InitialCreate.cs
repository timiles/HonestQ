using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.MobileNotifications.NotificationsApp.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Run",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Type = table.Column<string>(maxLength: 20, nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(nullable: false),
                    FinishedAt = table.Column<DateTimeOffset>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Run", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PushedNotification",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    NotificationId = table.Column<long>(nullable: false),
                    PushToken = table.Column<string>(maxLength: 2000, nullable: false),
                    SentAt = table.Column<DateTimeOffset>(nullable: false),
                    Status = table.Column<string>(maxLength: 50, nullable: false),
                    ExpoId = table.Column<Guid>(nullable: true),
                    Message = table.Column<string>(maxLength: 1000, nullable: true),
                    Error = table.Column<string>(maxLength: 50, nullable: true),
                    RunId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PushedNotification", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PushedNotification_Run_RunId",
                        column: x => x.RunId,
                        principalTable: "Run",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PushedNotification_RunId",
                table: "PushedNotification",
                column: "RunId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PushedNotification");

            migrationBuilder.DropTable(
                name: "Run");
        }
    }
}
