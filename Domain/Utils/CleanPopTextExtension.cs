namespace Pobs.Domain.Utils
{
    public static class CleanPopTextExtension
    {
        public static string CleanPopText(this string value)
        {
            value = value.Trim(' ', '\t');
            if (value.StartsWith("\"") || value.EndsWith("\""))
            {
                if (!value.Substring(1, value.Length - 2).Contains("\""))
                {
                    // If we start or end with a quote, and there are no quotes in between, trim it
                    value = value.Trim('\"');
                }
            }
            return value;
        }
    }
}