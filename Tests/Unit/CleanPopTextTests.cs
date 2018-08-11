using System;
using Xunit;
using Pobs.Domain.Utils;

namespace Pobs.Tests.Unit
{
    public class CleanPopTextTests
    {
        [Theory]
        [InlineData("\"Hello there!\"", "Hello there!")]
        [InlineData("     Hello there!   ", "Hello there!")]
        [InlineData("\tHello there!\t", "Hello there!")]
        [InlineData(" \t \"Hello there!\" \t ", "Hello there!")]
        [InlineData("I said, \"don't remove quotes from inside the text\"!", "I said, \"don't remove quotes from inside the text\"!")]
        [InlineData("\"Hello\" is a polite greeting. So is \"hi\"", "\"Hello\" is a polite greeting. So is \"hi\"")]
        public void Assertions(string value, string expectedValue)
        {
            Assert.Equal(expectedValue, value.CleanPopText());
        }
    }
}
