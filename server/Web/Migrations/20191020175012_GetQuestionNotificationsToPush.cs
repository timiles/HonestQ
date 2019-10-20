using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class GetQuestionNotificationsToPush : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE PROCEDURE GetQuestionNotificationsToPush(IN _sinceNotificationId BIGINT)
BEGIN

    select n.Id as NotificationId, pt.Token as PushToken, q.Id as QuestionId, q.Text as QuestionText,
        group_concat(t.Name order by t.Name separator '|') as TagNames
	from Notification n
	inner join PushToken pt on n.OwnerUserId = pt.UserId
	inner join Question q on n.QuestionId = q.Id
	inner join QuestionTag qt on q.Id = qt.QuestionId
	inner join Watch w on qt.TagId = w.TagId and n.OwnerUserId = w.UserId
	inner join Tag t on w.TagId = t.Id
	where n.Id > _sinceNotificationId and n.Seen = 0 and q.Status = 0
    group by n.Id, pt.Token, q.Id, q.Text;
    
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE GetQuestionNotificationsToPush");
        }
    }
}
