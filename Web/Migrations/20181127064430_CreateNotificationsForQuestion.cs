using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CreateNotificationsForQuestion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE PROCEDURE CreateNotificationsForQuestion(IN _questionId INT)
BEGIN

    INSERT INTO Notification (OwnerUserId, Seen, QuestionId)
    SELECT DISTINCT w.UserId, 0, _questionId
    FROM Question q
    INNER JOIN QuestionTag qt on q.Id = qt.QuestionId
    INNER JOIN Watch w on qt.TagId = w.TagId
    WHERE q.Id = _questionId AND w.UserId != q.PostedByUserId;

END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE CreateNotificationsForQuestion");
        }
    }
}
