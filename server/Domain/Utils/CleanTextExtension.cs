
namespace Pobs.Domain.Utils
{
    public static class CleanTextExtension
    {
        public static string CleanText(this string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }
            return value.Trim(' ', '\t', '\n', '\r');
        }
    }
}