using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Pobs.Domain.Utils
{
    public static class StringToSlugExtension
    {
        /*
         * We will strip invalid characters and delimit words with underscores.
         * We don't remove stop words - it is probably good practice when we're in 100% control of the slug,
         * but not necessary, and could instead cause problems for auto generated slugs.
         * Sources:
         * - https://moz.com/blog/15-seo-best-practices-for-structuring-urls "#8: ... You don't have to leave them out"
         * - StackExchange leaves all the words from the question in the slug
         */

        // White space, full-stop, comma, colon, semicolon, em-dash, en-dash, hyphen, underscore, ellipsis
        private static readonly Regex s_wordDelimiters = new Regex(@"[\s\.,:;—–\-_…]", RegexOptions.Compiled);
        private static readonly Regex s_lowerCaseInvalidChars = new Regex(@"[^a-z0-9\-_]", RegexOptions.Compiled);
        private static readonly Regex s_anyCaseInvalidChars = new Regex(@"[^a-zA-Z0-9\-_]", RegexOptions.Compiled);
        private static readonly Regex s_multipleUnderscores = new Regex(@"_{2,}", RegexOptions.Compiled);

        public static string ToSlug(this string value, bool preserveCasing = false)
        {
            if (!preserveCasing)
            {
                value = value.ToLowerInvariant();
            }
            value = value.RemoveDiacritics();

            // Replace all word delimiters with underscores
            value = s_wordDelimiters.Replace(value, "_");

            // Strip out invalid characters
            value = (preserveCasing ? s_anyCaseInvalidChars : s_lowerCaseInvalidChars).Replace(value, "");

            // Replace multiple underscores with a single underscore
            value = s_multipleUnderscores.Replace(value, "_");

            // Trim underscores from ends
            return value.Trim('_');
        }

        private static string RemoveDiacritics(this string value)
        {
            // Normalizing splits eg 'é' into 2 chars: 'e' followed by (char)769, an acute NonSpacingMark
            string normalizedValueFormD = value.Normalize(NormalizationForm.FormD);

            var withoutNonSpacingMarks = normalizedValueFormD
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray();

            return new string(withoutNonSpacingMarks).Normalize(NormalizationForm.FormC);
        }
    }
}