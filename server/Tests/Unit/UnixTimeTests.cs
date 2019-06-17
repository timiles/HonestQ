using Xunit;
using Pobs.Domain.Utils;
using System;

namespace Pobs.Tests.Unit
{
    public class UnixTimeTests
    {
        [Fact]
        public void HandlesNull()
        {
            Assert.Null((null as long?).ToUnixDateTime());
        }

        [Fact]
        public void ConvertsMillisecondsCorrectly()
        {
            long? value = 1541500846000;
            Assert.Equal("Tuesday, November 6, 2018 10:40:46", value.ToUnixDateTime().Value.ToString("F"));
        }
    }
}
