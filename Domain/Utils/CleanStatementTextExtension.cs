namespace Pobs.Domain.Utils
{
    public static class CleanStatementTextExtension
    {
        public static string CleanStatementText(this string value)
        {
            return value.Trim(' ', '\'', '"', '\t');
        }
    }
}