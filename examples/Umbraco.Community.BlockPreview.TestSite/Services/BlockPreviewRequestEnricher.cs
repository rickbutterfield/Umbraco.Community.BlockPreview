using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.TestSite.Services
{
    public class BlockPreviewRequestEnricher : IBlockPreviewRequestEnricher
    {
        public Task EnrichAsync(HttpContext httpContext, IPublishedContent? content, string? blockEditorAlias, string? contentElementAlias, string? contentUdi = null, string? settingsUdi = null, int? blockIndex = null)
        {
            if (content == null)
            {
                return Task.CompletedTask;
            }

            var theme = content.Value<string>("theme", fallback: Fallback.ToAncestors);

            if (!String.IsNullOrEmpty(theme))
            {
                httpContext.Items["theme"] = theme;
            }

            return Task.CompletedTask;
        }
    }
}
