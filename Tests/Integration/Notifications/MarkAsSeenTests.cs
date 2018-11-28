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
    public class MarkAsSeenTests : IDisposable
    {
        private string _buildUrl(long notificationId) => $"/api/notifications/{notificationId}/seen";

        private readonly int _notificationOwnerUserId;
        private readonly Notification _notification;

        public MarkAsSeenTests()
        {
            var user = DataHelpers.CreateUser();
            _notificationOwnerUserId = user.Id;

            // In reality, the questions should be posted by a different user, but it's not a requirement for this test.
            var question = DataHelpers.CreateQuestions(user, 1).Single();
            _notification = DataHelpers.CreateNotifications(user, question).Single();
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_buildUrl(_notification.Id), null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldMarkAsSeen()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_notificationOwnerUserId);

                var response = await client.PostAsync(_buildUrl(_notification.Id), null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedNotification = dbContext.Notifications.Find(_notification.Id);
                    Assert.True(reloadedNotification.Seen);
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
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(1);

                var response = await client.PostAsync(_buildUrl(_notification.Id), null);
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    var reloadedNotification = dbContext.Notifications.Find(_notification.Id);
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
