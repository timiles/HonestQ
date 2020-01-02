using Xunit;
using Pobs.Domain.Utils;

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
            Assert.Equal("2018-11-06T10:40:46.0000000", value.ToUnixDateTime().Value.ToString("o"));
        }
    }
}
