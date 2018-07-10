using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Topics
{
    public class GetStatementParentCommentTests : IDisposable
    {
        private string _generateUrl(string topicSlug, int statementId, long? commentId) =>
            $"/api/topics/{topicSlug}/statements/{statementId}" + (commentId.HasValue ? $"/comments/{commentId}" : "");
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
            _topic = DataHelpers.CreateTopic(statementUser, 1, statementUser, 3, childCommentUser, 2);
            _statement = _topic.Statements.First();
        }

        [Fact]
        public async Task GetStatement_ShouldGetTopLevelCommentsOnly()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_statementUserId);

                var url = _generateUrl(_topic.Slug, _statement.Id, null);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementModel>(responseContent);
                Assert.Equal(3, responseModel.Comments.Length);

                foreach (var comment in _statement.Comments.Where(x => x.ParentComment == null))
                {
                    Assert.NotNull(responseModel.Comments.SingleOrDefault(x => x.Id == comment.Id));
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

                var url = _generateUrl(_topic.Slug, _statement.Id, comment.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                Assert.Equal(comment.ChildComments.Count(), responseModel.Comments.Length);

                foreach (var childComment in comment.ChildComments)
                {
                    Assert.NotNull(responseModel.Comments.SingleOrDefault(x => x.Id == childComment.Id));
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
