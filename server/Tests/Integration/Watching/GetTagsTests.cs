using System;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Watching
{
    public class GetTagsTests : IDisposable
    {
        private readonly string _url = "/api/watching/tags";

        private readonly int _userId;
        private readonly Tag _watchingTag;
        private readonly Tag _notWatchingTag;

        public GetTagsTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;

            // var question = DataHelpers.CreateQuestions(user, 1, user, 1).Single();
            // var answer = question.Answers.Single();
            _watchingTag = DataHelpers.CreateTag(user);
            DataHelpers.CreateWatch(user.Id, _watchingTag);

            _notWatchingTag = DataHelpers.CreateTag(user);
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_url);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldGetWatchingTagsOnly()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagsListModel>(responseContent);

                Assert.Single(responseModel.Tags);
                Assert.Equal(this._watchingTag.Slug, responseModel.Tags[0].Slug);
                Assert.Equal(this._watchingTag.Name, responseModel.Tags[0].Name);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId);
        }
    }
}
