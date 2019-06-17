using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Notifications;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class GetNotificationsCountTests : IDisposable
    {
        private readonly string _url = "/api/notifications/count";

        private readonly int _notificationOwnerUserId;
        private readonly IEnumerable<Notification> _notifications;

        public GetNotificationsCountTests()
        {
            var user = DataHelpers.CreateUser();
            _notificationOwnerUserId = user.Id;

            // In reality, the questions should be posted by a different user, but it's not a requirement for this test.
            var question = DataHelpers.CreateQuestions(user, 1, user, 1).Single();
            var answer = question.Answers.Single();
            var comment = DataHelpers.CreateComments(answer, user, 1).Single();
            var childComment = DataHelpers.CreateChildComments(comment, user, 1).Single();

            _notifications = DataHelpers.CreateNotifications(user, question, answer, comment, childComment);
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
        public async Task ShouldGetNotificationsCount()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsCountModel>(responseContent);

                Assert.Equal(_notifications.Count(), responseModel.Count);
            }
        }

        [Fact]
        public async Task MarkAllAsSeen_ShouldGetZero()
        {
            using (var dbContext = TestSetup.CreateDbContext())
            {
                foreach (var notification in _notifications)
                {
                    dbContext.Attach(notification);
                    notification.Seen = true;
                }
                dbContext.SaveChanges();
            }

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<NotificationsCountModel>(responseContent);

                Assert.Equal(0, responseModel.Count);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_notificationOwnerUserId);
        }
    }
}
