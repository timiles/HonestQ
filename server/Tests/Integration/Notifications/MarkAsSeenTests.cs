using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Xunit;

namespace Pobs.Tests.Integration.Notifications
{
    public class MarkAsSeenTests : IDisposable
    {
        private string _buildUrl(long notificationId) => $"/api/notifications/{notificationId}/seen";

        private readonly int _notificationOwnerUserId;
        private readonly IList<Notification> _notifications;

        public MarkAsSeenTests()
        {
            var user = DataHelpers.CreateUser();
            _notificationOwnerUserId = user.Id;

            // In reality, the questions should be posted by a different user, but it's not a requirement for this test.
            var question = DataHelpers.CreateQuestions(user, 1, user, 1).Single();
            _notifications = DataHelpers.CreateNotifications(user, question, question.Answers.Single()).ToList();
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_buildUrl(_notifications[0].Id), null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldMarkAsSeen()
        {
            var markAsSeenNotification = _notifications[0];
            var unseenNotification = _notifications[1];

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.PostAsync(_buildUrl(markAsSeenNotification.Id), null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    Assert.True(dbContext.Notifications.Find(markAsSeenNotification.Id).Seen);
                    Assert.False(dbContext.Notifications.Find(unseenNotification.Id).Seen);
                }
            }
        }

        [Fact]
        public async Task InvalidNotificationId_ShouldGetNotFound()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.PostAsync(_buildUrl(0), null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task AuthenticatedAsDifferentUser_ShouldGetNotFound()
        {
            var notification = _notifications[0];

            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1);

                var response = await client.PostAsync(_buildUrl(notification.Id), null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedNotification = dbContext.Notifications.Find(notification.Id);
                    Assert.False(reloadedNotification.Seen);
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_notificationOwnerUserId);
        }
    }
}
