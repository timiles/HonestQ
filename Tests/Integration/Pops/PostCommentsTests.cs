using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Pops;
using Pobs.Web.Models.Topics;
using Xunit;

namespace Pobs.Tests.Integration.Pops
{
    public class PostCommentsTests : IDisposable
    {
        private string _generateUrl(int popId) => $"/api/pops/{popId}/comments";
        private readonly User _user;
        private readonly Topic _topic;

        public PostCommentsTests()
        {
            var user = DataHelpers.CreateUser();
            _user = user;
            // Create a pop for every Type
            _topic = DataHelpers.CreateTopic(user, numberOfPopsPerType: 1);
        }

        [Fact]
        public async Task Authenticated_ShouldAddComment()
        {
            var popId = _topic.Pops.Skip(1).First().Id;
            var agreementRating = AgreementRating.Agree;
            var payload = new
            {
                Text = "My insightful comment on this pop",
                AgreementRating = agreementRating.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pop = dbContext.Pops
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .FirstOrDefault(x => x.Id == popId);
                    var comment = pop.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(agreementRating, comment.AgreementRating);
                    Assert.Equal(_user.Id, comment.PostedByUser.Id);
                    Assert.True(comment.PostedAt > DateTime.UtcNow.AddMinutes(-1));


                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

                    Assert.Equal(comment.Id, responseModel.Id);
                    Assert.Equal(comment.Text, responseModel.Text);
                    AssertHelpers.Equal(comment.PostedAt, responseModel.PostedAt, 10);
                }
            }
        }

        [Fact]
        public async Task Emoji_ShouldPersist()
        {
            var popId = _topic.Pops.Skip(1).First().Id;
            var payload = new
            {
                Text = "Here's a poop emoji: 💩",
                Source = "https://example.com/💩",
                AgreementRating = AgreementRating.StronglyAgree.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pop = dbContext.Pops
                        .Include(x => x.Comments)
                        .FirstOrDefault(x => x.Id == popId);
                    var comment = pop.Comments.Single();
                    Assert.Equal(payload.Text, comment.Text);
                    Assert.Equal(payload.Source, comment.Source);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.Source, responseModel.Source);
                }
            }
        }

        [Fact]
        public async Task SourceOnly_ShouldPersist()
        {
            var popId = _topic.Pops.Skip(1).First().Id;
            var payload = new
            {
                Source = "https://example.com/",
                AgreementRating = AgreementRating.Neutral.ToString()
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var pop = dbContext.Pops
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .Single(x => x.Id == popId);

                    var comment = pop.Comments.Single();
                    Assert.Null(comment.Text);
                    Assert.Equal(payload.Source, comment.Source);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(comment.Source, responseModel.Source);
                }
            }
        }

        [Fact]
        public async Task ParentCommentId_ShouldPersist()
        {
            var pop = _topic.Pops.Skip(1).First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(pop);
                var comment = new Comment("Parent", _user, DateTimeOffset.UtcNow, AgreementRating.Neutral);
                pop.Comments.Add(comment);
                dbContext.SaveChanges();
            }

            var parentComment = pop.Comments.First();
            var payload = new
            {
                Text = "My insightful child comment on this parent comment",
                ParentCommentId = parentComment.Id,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(pop.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedPop = dbContext.Pops
                        .Include(x => x.Comments)
                        .Include(x => x.PostedByUser)
                        .Single(x => x.Id == pop.Id);
                    var reloadedParentComment = reloadedPop.Comments.Single(x => x.Id == parentComment.Id);
                    var comment = reloadedParentComment.ChildComments.Single();
                    Assert.Equal(payload.Text, comment.Text);

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseModel = JsonConvert.DeserializeObject<CommentModel>(responseContent);

                    Assert.Equal(comment.Id, responseModel.Id);
                    Assert.Equal(comment.Text, responseModel.Text);
                    Assert.Equal(reloadedParentComment.Id, responseModel.ParentCommentId);


                    // Delete the child comment first to not upset foreign key constraints
                    reloadedParentComment.ChildComments.Remove(comment);
                    dbContext.SaveChanges();
                }
            }
        }

        [Theory]
        [InlineData("RequestForProof")]
        [InlineData("Question")]
        public async Task Type_WithAgreementRating_ShouldGetBadRequest(string type)
        {
            var pop = _topic.Pops.First(x => x.Type.ToString() == type);
            var payload = new
            {
                Text = "My insightful response",
                AgreementRating = AgreementRating.Disagree,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(pop.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"AgreementRating is invalid when Type is {type}", responseContent);
            }
        }

        [Fact]
        public async Task ParentCommentId_WithAgreementRating_ShouldGetBadRequest()
        {
            var pop = _topic.Pops.Skip(1).First();
            using (var dbContext = TestSetup.CreateDbContext())
            {
                dbContext.Attach(pop);
                var comment = new Comment("Parent", _user, DateTimeOffset.UtcNow, AgreementRating.Neutral);
                pop.Comments.Add(comment);
                dbContext.SaveChanges();
            }

            var parentComment = pop.Comments.First();
            var agreementRating = AgreementRating.Agree;
            var payload = new
            {
                Text = "My insightful child comment on this parent comment",
                AgreementRating = agreementRating.ToString(),
                ParentCommentId = parentComment.Id,
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(pop.Id);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("AgreementRating is invalid with ParentCommentId", responseContent);
            }
        }

        [Fact]
        public async Task NoTextAndNoSource_ShouldGetBadRequest()
        {
            var popId = _topic.Pops.Skip(1).First().Id;
            var payload = new
            {
                AgreementRating = AgreementRating.Neutral.ToString(),
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal("Text or Source is required", responseContent);
            }
        }

        [Fact]
        public async Task InvalidAgreementRating_ShouldGetBadRequest()
        {
            var popId = _topic.Pops.Skip(1).First().Id;
            var payload = new
            {
                Text = "My insightful comment on this pop",
                AgreementRating = "NotReallySureToBeHonest"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var responseContent = await response.Content.ReadAsStringAsync();
                Assert.Equal($"Invalid AgreementRating: {payload.AgreementRating}", responseContent);
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var popId = _topic.Pops.First().Id;
            var payload = new
            {
                Text = "My insightful pop on this topic"
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(popId);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }

            using (var dbContext = TestSetup.CreateDbContext())
            {
                var pop = dbContext.Pops
                        .Include(x => x.Comments)
                        .Single(x => x.Id == popId);

                Assert.Empty(pop.Comments);
            }
        }

        [Fact]
        public async Task UnknownPopId_ShouldReturnNotFound()
        {
            var payload = new
            {
                Text = "My insightful pop on this topic",
                AgreementRating = AgreementRating.Neutral
            };
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_user.Id);

                var url = _generateUrl(0);
                var response = await client.PostAsync(url, payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_user.Id);
        }
    }
}
