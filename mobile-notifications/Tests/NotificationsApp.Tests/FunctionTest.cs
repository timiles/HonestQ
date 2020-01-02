using Xunit;
using Moq;
using Amazon.Lambda.Core;
using System.Threading.Tasks;

namespace Pobs.MobileNotifications.NotificationsApp.Tests
{
    public class FunctionTest
    {
        [Fact]
        public async Task RunFunction()
        {
            // Arrange
            var loggerMock = new Mock<ILambdaLogger>();
            var webDb = "Server=localhost;Database=honestqweb;User=root;Password=poi123;";
            var notificationsDb = "Server=localhost;Database=honestqnotifications;User=root;Password=poi123;";
            var notificationsRunner = new NotificationsRunner(webDb, notificationsDb, loggerMock.Object.LogLine);

            // Act
            await notificationsRunner.RunAsync();

            // Assert - we only log when an error occurred.
            loggerMock.Verify(x => x.Log(It.IsAny<string>()), Times.Never);
            loggerMock.Verify(x => x.LogLine(It.IsAny<string>()), Times.Never);
        }

        // TODO: unit tests
    }
}
