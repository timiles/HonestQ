using System;
using Xunit;
using Pobs.Domain.Utils;

namespace Pobs.Tests.Unit
{
    public class CleanTextTests
    {
        [Theory]
        [InlineData(null, null)]
        [InlineData("", null)]
        [InlineData("  \t \r\n", null)]
        [InlineData("     Hello there!   ", "Hello there!")]
        [InlineData("\tHello there!\t\r\n", "Hello there!")]
        [InlineData(" \t \"Hello there!\" \t ", "\"Hello there!\"")]
        public void Assertions(string value, string expectedValue)
        {
            Assert.Equal(expectedValue, value.CleanText());
        }
    }
}
