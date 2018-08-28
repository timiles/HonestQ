using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class GetPopParentCommentTests : IDisposable
    {
        private string _generateUrl(int popId, long? commentId) =>
            $"/api/pops/{popId}" + (commentId.HasValue ? $"/comments/{commentId}" : "");
        private readonly int _popUserId;
        private readonly int _childCommentUserId;
        private readonly Topic _topic;
        private readonly Pop _pop;

        public GetPopParentCommentTests()
        {
            var popUser = DataHelpers.CreateUser();
            _popUserId = popUser.Id;
            var childCommentUser = DataHelpers.CreateUser();
            _childCommentUserId = childCommentUser.Id;
            _topic = DataHelpers.CreateTopic(popUser, 1,
                commentUser: popUser, numberOfCommentsPerPop: 3,
                childCommentUser: childCommentUser, numberOfChildCommentsPerComment: 2);
            _pop = _topic.Pops.First();
        }

        [Fact]
        public async Task GetPop_ShouldGetAllComments()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl(_pop.Id, null);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<PopModel>(responseContent);
                Assert.Equal(3, responseModel.Comments.Length);
                Assert.True(responseModel.IsPostedByLoggedInUser);

                foreach (var comment in _pop.Comments.Where(x => x.ParentComment == null))
                {
                    var responseComment = responseModel.Comments.SingleOrDefault(x => x.Id == comment.Id);
                    Assert.NotNull(responseComment);
                    Assert.Equal(0, responseComment.PostedByUserPseudoId);
                    Assert.True(responseComment.IsPostedByLoggedInUser);

                    Assert.Equal(2, responseComment.Comments.Count());
                    foreach (var responseChildComment in responseComment.Comments)
                    {
                        Assert.Equal(1, responseChildComment.PostedByUserPseudoId);
                        Assert.False(responseChildComment.IsPostedByLoggedInUser);
                    }
                }
            }
        }

        [Fact]
        public async Task GetComment_ShouldGetChildComments()
        {
            var comment = _pop.Comments.First();

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_popUserId);

                var url = _generateUrl(_pop.Id, comment.Id);
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
            DataHelpers.DeleteUser(_popUserId);
        }
    }
}
