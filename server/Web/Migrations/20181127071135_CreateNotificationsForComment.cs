using Microsoft.EntityFrameworkCore.Migrations;

namespace Pobs.Web.Migrations
{
    public partial class CreateNotificationsForComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE PROCEDURE CreateNotificationsForComment(IN _commentId INT)
BEGIN

    DECLARE _postedByUserId, _answerId INT;
    DECLARE _parentCommentId BIGINT;
    SELECT PostedByUserId, AnswerId, ParentCommentId
        INTO _postedByUserId, _answerId, _parentCommentId
    FROM Comment
    WHERE Id = _commentId;

    IF (_parentCommentId IS NOT NULL)
    THEN
        -- Notify Users watching Parent Comment
        INSERT INTO Notification (OwnerUserId, Seen, CommentId)
        SELECT DISTINCT w.UserId, 0, _commentId
        FROM Watch w
        WHERE w.CommentId = _parentCommentId AND w.UserId != _postedByUserId;
    ELSE
        -- Notify Users watching Answer
        INSERT INTO Notification (OwnerUserId, Seen, CommentId)
        SELECT DISTINCT w.UserId, 0, _commentId
        FROM Watch w
        WHERE w.AnswerId = _answerId AND w.UserId != _postedByUserId;
    END IF;
    
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE CreateNotificationsForComment");
        }
    }
}
