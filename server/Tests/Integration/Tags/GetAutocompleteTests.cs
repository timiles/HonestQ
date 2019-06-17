using System;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Tags;
using Xunit;

namespace Pobs.Tests.Integration.Tags
{
    public class GetAutocompleteTests : IDisposable
    {
        private string _generateUrl(string q) => $"/api/tags/autocomplete?q={q}";
        private readonly int _userId;
        private readonly Tag _unapprovedTagBeginningWithA;
        private readonly Tag _approvedTagBeginningWithA1;
        private readonly Tag _approvedTagBeginningWithA2;
        private readonly Tag _approvedTagBeginningWithB;

        public GetAutocompleteTests()
        {
            var user = DataHelpers.CreateUser();
            _userId = user.Id;
            _unapprovedTagBeginningWithA = DataHelpers.CreateTag(user, isApproved: false, tagNamePrefix: "A");
            _approvedTagBeginningWithA1 = DataHelpers.CreateTag(user, isApproved: true, tagNamePrefix: "A");
            _approvedTagBeginningWithA2 = DataHelpers.CreateTag(user, isApproved: true, tagNamePrefix: "a");
            _approvedTagBeginningWithB = DataHelpers.CreateTag(user, isApproved: true, tagNamePrefix: "B");
        }

        [Fact]
        public async Task ShouldGetTags()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_generateUrl("A"));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagAutocompleteResultsModel>(responseContent);

                // Check that all of our Tags are in the response. (There may be more too.)
                var tagSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.Contains(_approvedTagBeginningWithA1.Slug, tagSlugs);
                Assert.Contains(_approvedTagBeginningWithA2.Slug, tagSlugs);
                Assert.DoesNotContain(_unapprovedTagBeginningWithA.Slug, tagSlugs);
                Assert.DoesNotContain(_approvedTagBeginningWithB.Slug, tagSlugs);
            }
        }

        [Fact]
        public async Task ShouldBeCaseInsensitive()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.GetAsync(_generateUrl("a"));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagAutocompleteResultsModel>(responseContent);

                // Check that all of our Tags are in the response. (There may be more too.)
                var tagSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.Contains(_approvedTagBeginningWithA1.Slug, tagSlugs);
                Assert.Contains(_approvedTagBeginningWithA2.Slug, tagSlugs);
                Assert.DoesNotContain(_unapprovedTagBeginningWithA.Slug, tagSlugs);
                Assert.DoesNotContain(_approvedTagBeginningWithB.Slug, tagSlugs);
            }
        }

        [Fact]
        public async Task ShouldOnlyGetTagsBeginningWithLetter()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var characterIn1ThatIsNotA = _approvedTagBeginningWithA1.Name.First(x => x != 'A' && x != 'a');
                var response = await client.GetAsync(_generateUrl(characterIn1ThatIsNotA.ToString()));
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<TagAutocompleteResultsModel>(responseContent);

                var tagSlugs = responseModel.Values.Select(x => x.Slug).ToArray();
                Assert.DoesNotContain(_approvedTagBeginningWithA1.Slug, tagSlugs);
            }
        }

        public void Dispose()
        {
            // This cascades to the Tags too
            DataHelpers.DeleteUser(_userId);
        }
    }
}
