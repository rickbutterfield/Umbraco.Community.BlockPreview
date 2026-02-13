using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.TestSite.Services
{
    /// <inheritdoc />
    public class BlockPreviewResponseEnricher : IBlockPreviewResponseEnricher
    {
        /// <inheritdoc />
        public Task<string> EnrichAsync(
            string markup,
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null
        ) => Task.FromResult(markup);
    }
}
