using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CascaseAllTheDeletes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Answer_Question_QuestionId",
                table: "Answer");

            migrationBuilder.DropForeignKey(
                name: "FK_Comment_Answer_AnswerId",
                table: "Comment");

            migrationBuilder.DropForeignKey(
                name: "FK_Comment_Comment_ParentCommentId",
                table: "Comment");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Answer_AnswerId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Comment_CommentId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Question_QuestionId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Answer_AnswerId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Comment_CommentId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Question_QuestionId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Tag_TagId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_User_UserId",
                table: "Watch");

            migrationBuilder.AddForeignKey(
                name: "FK_Answer_Question_QuestionId",
                table: "Answer",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comment_Answer_AnswerId",
                table: "Comment",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comment_Comment_ParentCommentId",
                table: "Comment",
                column: "ParentCommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Answer_AnswerId",
                table: "Notification",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Comment_CommentId",
                table: "Notification",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Question_QuestionId",
                table: "Notification",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Answer_AnswerId",
                table: "Watch",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Comment_CommentId",
                table: "Watch",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Question_QuestionId",
                table: "Watch",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Tag_TagId",
                table: "Watch",
                column: "TagId",
                principalTable: "Tag",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_User_UserId",
                table: "Watch",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Answer_Question_QuestionId",
                table: "Answer");

            migrationBuilder.DropForeignKey(
                name: "FK_Comment_Answer_AnswerId",
                table: "Comment");

            migrationBuilder.DropForeignKey(
                name: "FK_Comment_Comment_ParentCommentId",
                table: "Comment");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Answer_AnswerId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Comment_CommentId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Question_QuestionId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Answer_AnswerId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Comment_CommentId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Question_QuestionId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_Tag_TagId",
                table: "Watch");

            migrationBuilder.DropForeignKey(
                name: "FK_Watch_User_UserId",
                table: "Watch");

            migrationBuilder.AddForeignKey(
                name: "FK_Answer_Question_QuestionId",
                table: "Answer",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comment_Answer_AnswerId",
                table: "Comment",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Comment_Comment_ParentCommentId",
                table: "Comment",
                column: "ParentCommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Answer_AnswerId",
                table: "Notification",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Comment_CommentId",
                table: "Notification",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Question_QuestionId",
                table: "Notification",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Answer_AnswerId",
                table: "Reaction",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reaction_Comment_CommentId",
                table: "Reaction",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Answer_AnswerId",
                table: "Watch",
                column: "AnswerId",
                principalTable: "Answer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Comment_CommentId",
                table: "Watch",
                column: "CommentId",
                principalTable: "Comment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Question_QuestionId",
                table: "Watch",
                column: "QuestionId",
                principalTable: "Question",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_Tag_TagId",
                table: "Watch",
                column: "TagId",
                principalTable: "Tag",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Watch_User_UserId",
                table: "Watch",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
