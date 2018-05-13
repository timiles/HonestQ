using System;
using System.Linq;

namespace Pobs.Tests.Integration.Helpers
{
    static class Utils
    {
        private static readonly Random _random = new Random();
        internal static string GenerateRandomString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            return new string(Enumerable.Repeat(chars, length).Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}
