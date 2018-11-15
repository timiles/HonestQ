
namespace Pobs.Domain.Utils
{
    public static class CleanTextExtension
    {
        public static string CleanText(this string value)
        {
            return value.Trim(' ', '\t', '\n', '\r');
        }
    }
}