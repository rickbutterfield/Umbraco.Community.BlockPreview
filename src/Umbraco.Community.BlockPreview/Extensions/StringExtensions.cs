using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Extensions;

/// <summary>
/// Extension methods for string manipulation.
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Converts a string to PascalCase.
    /// </summary>
    /// <param name="value">The string to convert.</param>
    /// <returns>The string in PascalCase.</returns>
    public static string ToPascalCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        return $"{char.ToUpper(value[0], CultureInfo.CurrentCulture)}{value[1..]}";
    }

    /// <summary>
    /// Converts a string to camelCase.
    /// </summary>
    /// <param name="value">The string to convert.</param>
    /// <returns>The string in camelCase.</returns>
    public static string ToCamelCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        return $"{char.ToLower(value[0], CultureInfo.CurrentCulture)}{value[1..]}";
    }

    /// <summary>
    /// Attempts to convert an object to a block grid item.
    /// </summary>
    /// <param name="rawPropValue">The raw property value.</param>
    /// <param name="value">The resulting block value if conversion succeeds.</param>
    /// <returns>True if the conversion succeeds; otherwise, false.</returns>
    public static bool TryConvertToGridItem(this object? rawPropValue, out BlockValue<BlockGridLayoutItem>? value)
    {
        if (!rawPropValue?.ToString()?.DetectIsJson() == true || rawPropValue is not JsonObject jObject)
        {
            value = default;
            return false;
        }

        if (jObject.ContainsKey("Layout") ||
            jObject.ContainsKey("ContentData") ||
            jObject.ContainsKey("SettingsData"))
        {
            value = JsonSerializer.Deserialize<BlockValue<BlockGridLayoutItem>>(rawPropValue?.ToString()!);
            return true;
        }

        value = default;
        return false;
    }
}