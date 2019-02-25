using System;
using Xunit;
using Pobs.Domain.Utils;

namespace Pobs.Tests.Unit
{
    public class ToSlugTests
    {
        [Theory]
        [InlineData("hello", "hello")]
        [InlineData("\"Hello there!\"", "hello_there")]
        [InlineData(" _- Hello there! -_ ", "hello_there")]
        [InlineData("Hello,there...good-bye -- forever!", "hello_there_good_bye_forever")]
        [InlineData("Hello…there", "hello_there")]
        [InlineData("Hello there ;-)", "hello_there")]
        [InlineData("Hello there 😉", "hello_there")]
        [InlineData("Hello hello!", "hello_hello")]
        [InlineData("Hello: http://www.example.com", "hello_http_www_example_com")]
        [InlineData("Let's not remove stop words like 'a' or 'the'; they add meaning",
            "lets_not_remove_stop_words_like_a_or_the_they_add_meaning")]
        [InlineData("café, cafetería, cafetière, caïque, calèche, canapé, cañón, cap-à-pie, Champs-Élysées, château",
            "cafe_cafeteria_cafetiere_caique_caleche_canape_canon_cap_a_pie_champs_elysees_chateau")]
        public void Assertions(string value, string expectedSlug)
        {
            Assert.Equal(expectedSlug, value.ToSlug());
        }

        [Theory]
        [InlineData("hello", "hello")]
        [InlineData("\"Hello there!\"", "Hello_there")]
        [InlineData(" _- Hello there! -_ ", "Hello_there")]
        [InlineData("Hello,there...good-bye -- forever!", "Hello_there_good_bye_forever")]
        [InlineData("Hello…there", "Hello_there")]
        [InlineData("Hello there ;-)", "Hello_there")]
        [InlineData("Hello there 😉", "Hello_there")]
        [InlineData("Hello hello!", "Hello_hello")]
        [InlineData("Hello: http://www.example.com", "Hello_http_www_example_com")]
        [InlineData("Let's not remove stop words like 'a' or 'the'; they add meaning",
            "Lets_not_remove_stop_words_like_a_or_the_they_add_meaning")]
        [InlineData("café, cafetería, cafetière, caïque, calèche, canapé, cañón, cap-à-pie, Champs-Élysées, château",
            "cafe_cafeteria_cafetiere_caique_caleche_canape_canon_cap_a_pie_Champs_Elysees_chateau")]
        public void PreserveCasingAssertions(string value, string expectedSlug)
        {
            Assert.Equal(expectedSlug, value.ToSlug(true));
        }
    }
}
