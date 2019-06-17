using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Pobs.Domain
{
    public static class PropertyBuilderExtensions
    {
        public static void HasCharSetForEmoji(this PropertyBuilder<string> property)
        {
            var maxLength = property.Metadata.FindAnnotation("MaxLength");
            if (maxLength == null)
            {
                throw new Exception($"Column \"{property.Metadata.Name}\" does not have MaxLength");
            }
            var isNullable = property.Metadata.IsNullable;
            // This syntax is specific to MySQL.
            property.HasColumnType($"VARCHAR({maxLength.Value}) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" +
                (isNullable ? "" : " NOT NULL"));
        }
    }
}