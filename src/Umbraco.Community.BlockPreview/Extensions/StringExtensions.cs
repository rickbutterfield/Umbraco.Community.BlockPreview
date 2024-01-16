using System.Globalization;

namespace Umbraco.Community.BlockPreview.Extensions;

public static class StringExtensions
{
    public static string ToPascalCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        return $"{char.ToUpper(value[0], CultureInfo.CurrentCulture)}{value[1..]}";
    }
}