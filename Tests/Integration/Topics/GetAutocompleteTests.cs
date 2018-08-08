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
    public class GetAutocompleteTests : IDisposable
    {
        private string _generateUrl(string q) => $"/api/topics/autocomplete?q={q}";
        private readonly int _userId;
        private readonly Topic _unapprovedTopicBeginningWithA;
        private readonly Topic _approvedTopicBeginningWithA1;
        private readonly Topic _approvedTopicBeginningWithA2;
        private readonly Topic _approvedTopicBeginningWithB;

        public GetAutocompleteTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _unapprovedTopicBeginningWithA = DataHelpers.CreateTopic(user, isApproved: false, topicNamePrefix: "A");
            _approvedTopicBeginningWithA1 = DataHelpers.CreateTopic(user, isApproved: true, topicNamePrefix: "A");
            _approvedTopicBeginningWithA2 = DataHelpers.CreateTopic(user, isApproved: true, topicNamePrefix: "a");
            _approvedTopicBeginningWithB = DataHelpers.CreateTopic(user, isApproved: true, topicNamePrefix: "B");
        }

        [Fact]
        public async Task ShouldGetTopics()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_generateUrl("A"));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicAutocompleteResultsModel>(responseContent);

                // Check that all of our Topics are in the response. (There may be more too.)
                var topicSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.Contains(_approvedTopicBeginningWithA1.Slug, topicSlugs);
                Assert.Contains(_approvedTopicBeginningWithA2.Slug, topicSlugs);
                Assert.DoesNotContain(_unapprovedTopicBeginningWithA.Slug, topicSlugs);
                Assert.DoesNotContain(_approvedTopicBeginningWithB.Slug, topicSlugs);
            }
        }

        [Fact]
        public async Task ShouldBeCaseInsensitive()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var response = await client.GetAsync(_generateUrl("a"));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicAutocompleteResultsModel>(responseContent);

                // Check that all of our Topics are in the response. (There may be more too.)
                var topicSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.Contains(_approvedTopicBeginningWithA1.Slug, topicSlugs);
                Assert.Contains(_approvedTopicBeginningWithA2.Slug, topicSlugs);
                Assert.DoesNotContain(_unapprovedTopicBeginningWithA.Slug, topicSlugs);
                Assert.DoesNotContain(_approvedTopicBeginningWithB.Slug, topicSlugs);
            }
        }

        [Fact]
        public async Task ShouldOnlyGetTopicsBeginningWithLetter()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_userId);

                var characterIn1ThatIsNotA = _approvedTopicBeginningWithA1.Name.First(x => x != 'A' && x != 'a');
                var response = await client.GetAsync(_generateUrl(characterIn1ThatIsNotA.ToString()));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TopicAutocompleteResultsModel>(responseContent);

                var topicSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.DoesNotContain(_approvedTopicBeginningWithA1.Slug, topicSlugs);
            }
        }

        public void Dispose()
        {
            // This cascades to the Topics too
            DataHelpers.DeleteUser(_userId);
        }
    }
}
