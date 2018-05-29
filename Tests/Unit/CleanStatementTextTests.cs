using System;
using Xunit;
using Pobs.Domain.Utils;

namespace Pobs.Tests.Unit
{
    public class CleanStatementTextTests
    {
        [Theory]
        [InlineData("\"Hello there!\"", "Hello there!")]
        [InlineData("     Hello there!   ", "Hello there!")]
        [InlineData("\tHello there!\t", "Hello there!")]
        [InlineData("'Hello there!'", "Hello there!")]
        [InlineData(" \t \"'Hello there!'\" \t ", "Hello there!")]
        [InlineData("I said, \"don't remove quotes from inside the text\"!", "I said, \"don't remove quotes from inside the text\"!")]
        public void Assertions(string value, string expectedValue)
        {
            Assert.Equal(expectedValue, value.CleanStatementText());
        }
    }
}
