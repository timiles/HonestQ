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
    public class MarkAllAsSeenTests : IDisposable
    {
        private const string _buildUrl = "/api/notifications/all/seen";

        private readonly int _userId1;
        private readonly int _userId2;
        private readonly IList<Notification> _user1Notifications;
        private readonly IList<Notification> _user2Notifications;

        public MarkAllAsSeenTests()
        {
            var user1 = DataHelpers.CreateUser();
            _userId1 = user1.Id;
            var user2 = DataHelpers.CreateUser();
            _userId2 = user2.Id;

            // In reality, the questions should be posted by a different user, but it's not a requirement for this test.
            var question = DataHelpers.CreateQuestions(user1, 1, user1, 1).Single();
            _user1Notifications = DataHelpers.CreateNotifications(user1, question, question.Answers.Single()).ToList();
            _user2Notifications = DataHelpers.CreateNotifications(user2, question, question.Answers.Single()).ToList();
        }

        [Fact]
        public async Task NotAuthenticated_ShouldGetUnauthorized()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                var response = await client.PostAsync(_buildUrl, null);
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }

        [Fact]
        public async Task ShouldMarkAllAsSeen()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_userId1);

                var response = await client.PostAsync(_buildUrl, null);
                response.EnsureSuccessStatusCode();

                using (var dbContext = TestSetup.CreateDbContext())
                {
                    foreach (var notification in _user1Notifications)
                    {
                        Assert.True(dbContext.Notifications.Find(notification.Id).Seen);
                    }
                    foreach (var notification in _user2Notifications)
                    {
                        Assert.False(dbContext.Notifications.Find(notification.Id).Seen);
                    }
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_userId1);
            DataHelpers.DeleteUser(_userId2);
        }
    }
}
