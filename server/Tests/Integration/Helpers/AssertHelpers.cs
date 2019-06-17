using System;
using Xunit;

namespace Pobs.Tests.Integration.Helpers
{
    internal static class AssertHelpers
    {
        public static void Equal(DateTimeOffset expected, DateTimeOffset actual, int numberOfTicksTolerance)
        {
            Assert.True(Math.Abs(expected.Ticks - actual.Ticks) <= numberOfTicksTolerance);
        }
    }
}
