using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CreateNotificationsForAnswer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE PROCEDURE CreateNotificationsForAnswer(IN _answerId INT)
BEGIN

    INSERT INTO Notification (OwnerUserId, Seen, AnswerId)
    SELECT DISTINCT w.UserId, 0, _answerId
    FROM Answer a
    INNER JOIN Watch w on a.QuestionId = w.QuestionId
    WHERE a.Id = _answerId AND w.UserId != a.PostedByUserId;

END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE CreateNotificationsForAnswer");
        }
    }
}
