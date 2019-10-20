using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class GetCommentNotificationsToPush : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE PROCEDURE GetCommentNotificationsToPush(IN _sinceNotificationId BIGINT)
BEGIN

    select n.Id as NotificationId, pt.Token as PushToken,
        q.Id as QuestionId, q.Text as QuestionText, a.Id as AnswerId, a.Text as AnswerText, c.Id as CommentId, c.Text as CommentText
	from Notification n
	inner join PushToken pt on n.OwnerUserId = pt.UserId
    inner join Comment c on n.CommentId = c.Id
    inner join Answer a on c.AnswerId = a.Id
	inner join Question q on a.QuestionId = q.Id
	inner join Watch w on a.Id = w.AnswerId and n.OwnerUserId = w.UserId
	where n.Id > _sinceNotificationId and n.Seen = 0 and q.Status = 0 and c.Status = 0;
    
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE GetCommentNotificationsToPush;");
        }
    }
}
