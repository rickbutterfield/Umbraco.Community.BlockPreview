using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Extensions;

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

    public static string ToCamelCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        return $"{char.ToLower(value[0], CultureInfo.CurrentCulture)}{value[1..]}";
    }

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