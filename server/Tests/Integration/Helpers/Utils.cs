using System;
using System.Linq;

namespace Pobs.Tests.Integration.Helpers
{
    internal static class Utils
    {
        private static readonly Random s_random = new Random();
        internal static string GenerateRandomString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            return new string(Enumerable.Repeat(chars, length).Select(s => s[s_random.Next(s.Length)]).ToArray());
        }
    }
}
