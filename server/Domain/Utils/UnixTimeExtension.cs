using System;

namespace Pobs.Domain.Utils
{
    public static class UnixTimeExtension
    {
        private static DateTime s_firstOfJanuary1970 = new DateTime(1970, 1, 1);

        public static DateTime? ToUnixDateTime(this long? unixTimeMilliseconds)
        {
            return unixTimeMilliseconds.HasValue ?
                s_firstOfJanuary1970.AddMilliseconds(unixTimeMilliseconds.Value) : null as DateTime?;
        }
    }
}