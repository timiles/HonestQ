using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Moq;
using Pobs.Comms;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class ReportAnswerTests : IDisposable
    {
        private string _generateUrl(int questionId, int answerId) =>
            $"/api/questions/{questionId}/answers/{answerId}/report";
        private readonly User _questionUser;
        private readonly User _reportingUser;
        private readonly Question _question;
        private readonly Answer _answer;
        private readonly ReportModel _payload = new ReportModel { Reason = Utils.GenerateRandomString(10) };

        public ReportAnswerTests()
        {
            _questionUser = DataHelpers.CreateUser();
            _reportingUser = DataHelpers.CreateUser();
            _question = DataHelpers.CreateQuestions(_questionUser, 1, _questionUser, 1).Single();
            _answer = _question.Answers.Single();
        }

        [Fact]
        public async Task Authenticated_ShouldSendEmail()
        {
            var mockEmailSender = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(mockEmailSender.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_reportingUser.Id);

                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PostAsync(url, _payload.ToJsonContent());
                response.EnsureSuccessStatusCode();

                mockEmailSender.Verify(x =>
                    x.SendReportAnswerEmail(_reportingUser.Id, _payload.Reason, _question.Id, _question.Text, _answer.Id, _answer.Text),
                    Times.Once);
            }
        }

        [Fact]
        public async Task NoReason_ShouldGetBadRequest()
        {
            var mockEmailSender = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(mockEmailSender.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_reportingUser.Id);

                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PostAsync(url, new ReportModel().ToJsonContent());
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

                var content = await response.Content.ReadAsStringAsync();
                Assert.Equal("Reason is required.", content);

                mockEmailSender.Verify(x =>
                    x.SendReportAnswerEmail(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()),
                    Times.Never);
            }
        }

        [Fact]
        public async Task NotAuthenticated_ShouldBeDenied()
        {
            var mockEmailSender = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(mockEmailSender.Object))
            using (var client = server.CreateClient())
            {
                var url = _generateUrl(_question.Id, _answer.Id);
                var response = await client.PostAsync(url, _payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

                mockEmailSender.Verify(x =>
                    x.SendReportAnswerEmail(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()),
                    Times.Never);
            }
        }

        [Fact]
        public async Task UnknownQuestionId_ShouldReturnNotFound()
        {
            var mockEmailSender = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(mockEmailSender.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_reportingUser.Id);

                var url = _generateUrl(0, _answer.Id);
                var response = await client.PostAsync(url, _payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

                mockEmailSender.Verify(x =>
                    x.SendReportAnswerEmail(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()),
                    Times.Never);
            }
        }

        [Fact]
        public async Task UnknownAnswerId_ShouldReturnNotFound()
        {
            var mockEmailSender = new Mock<IEmailSender>();
            using (var server = new IntegrationTestingServer(mockEmailSender.Object))
            using (var client = server.CreateClient())
            {
                client.AuthenticateAs(_reportingUser.Id);

                var url = _generateUrl(_question.Id, 0);
                var response = await client.PostAsync(url, _payload.ToJsonContent());
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

                mockEmailSender.Verify(x =>
                    x.SendReportAnswerEmail(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()),
                    Times.Never);
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_questionUser.Id);
            DataHelpers.DeleteUser(_reportingUser.Id);
        }
    }
}
