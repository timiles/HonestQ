using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Statements;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Statements
{
    public class GetStatementParentCommentTests : IDisposable
    {
        private string _generateUrl(int statementId, long? commentId) =>
            $"/api/statements/{statementId}" + (commentId.HasValue ? $"/comments/{commentId}" : "");
        private readonly int _statementUserId;
        private readonly int _childCommentUserId;
        private readonly Topic _topic;
        private readonly Statement _statement;

        public GetStatementParentCommentTests()
        {
            var statementUser = DataHelpers.CreateUser();
            _statementUserId = statementUser.Id;
            var childCommentUser = DataHelpers.CreateUser();
            _childCommentUserId = childCommentUser.Id;
            _topic = DataHelpers.CreateTopic(statementUser, 1,
                commentUser: statementUser, numberOfCommentsPerStatement: 3,
                childCommentUser: childCommentUser, numberOfChildCommentsPerComment: 2);
            _statement = _topic.Statements.First();
        }

        [Fact]
        public async Task GetStatement_ShouldGetAllComments()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_statementUserId);

                var url = _generateUrl(_statement.Id, null);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementModel>(responseContent);
                Assert.Equal(3, responseModel.Comments.Length);

                foreach (var comment in _statement.Comments.Where(x => x.ParentComment == null))
                {
                    var responseComment = responseModel.Comments.SingleOrDefault(x => x.Id == comment.Id);
                    Assert.NotNull(responseComment);
                    Assert.Equal(2, responseComment.Comments.Count());
                }
            }
        }

        [Fact]
        public async Task GetComment_ShouldGetChildComments()
        {
            var comment = _statement.Comments.First();

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_statementUserId);

                var url = _generateUrl(_statement.Id, comment.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                Assert.Equal(comment.ChildComments.Count(), responseModel.Comments.Length);

                foreach (var childComment in comment.ChildComments)
                {
                    var responseComment = responseModel.Comments.SingleOrDefault(x => x.Id == childComment.Id);
                    Assert.NotNull(responseComment);
                    Assert.Empty(responseComment.Comments);
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteAllChildComments(_topic.Id);
            DataHelpers.DeleteUser(_childCommentUserId);
            DataHelpers.DeleteUser(_statementUserId);
        }
    }
}
