using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Statements;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Statements
{
    public class GetStatementTests : IDisposable
    {
        private string _generateUrl(int statementId) => $"/api/statements/{statementId}";
        private readonly int _statementUserId;
        private readonly int _commentUserId;
        private readonly Topic _topic;

        public GetStatementTests()
        {
            var statementUser = DataHelpers.CreateUser();
            _statementUserId = statementUser.Id;
            var commentUser = DataHelpers.CreateUser();
            _commentUserId = commentUser.Id;
            // Create 3 statements so we can be sure we get the one we request
            _topic = DataHelpers.CreateTopic(statementUser, 3,
                commentUser: commentUser, numberOfCommentsPerStatement: 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetStatement()
        {
            // Don't get the first, just to be thorough
            var statement = _topic.Statements.Skip(1).First();

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_statementUserId);

                var url = _generateUrl(statement.Id);
                var response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<StatementModel>(responseContent);
                Assert.Equal(statement.Slug, responseModel.Slug);
                Assert.Equal(statement.Text, responseModel.Text);
                Assert.Equal(statement.Source, responseModel.Source);
                Assert.Equal(statement.Stance.ToString(), responseModel.Stance);

                Assert.Single(responseModel.Topics);
                Assert.Equal(_topic.Name, responseModel.Topics.Single().Name);
                Assert.Equal(_topic.Slug, responseModel.Topics.Single().Slug);

                Assert.Equal(3, statement.Comments.Count);
                Assert.Equal(statement.Comments.Count, responseModel.Comments.Length);

                foreach (var comment in statement.Comments)
                {
                    var responseComment = responseModel.Comments.Single(x => x.Id == comment.Id);
                    Assert.Equal(comment.Text, responseComment.Text);
                    Assert.Equal(comment.Source, responseComment.Source);
                    Assert.Equal(comment.AgreementRating.ToString(), responseComment.AgreementRating);
                }
            }
        }

        [Fact]
        public async Task UnknownStatementId_ShouldReturnNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_statementUserId);

                var url = _generateUrl(0);
                var response = await client.GetAsync(url);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_commentUserId);
            DataHelpers.DeleteUser(_statementUserId);
        }
    }
}