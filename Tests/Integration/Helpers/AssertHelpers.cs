using System;
using Xunit;

namespace Pobs.Tests.Integration.Helpers
{
    static class AssertHelpers
    {
        public static void Equal(DateTime expected, DateTime actual, int numberOfTicksTolerance)
        {
            Assert.True(Math.Abs(expected.Ticks - actual.Ticks) <= numberOfTicksTolerance);
        }
    }
}
