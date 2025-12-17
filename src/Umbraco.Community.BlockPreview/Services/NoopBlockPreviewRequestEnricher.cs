using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <inheritdoc />
    public class NoopBlockPreviewRequestEnricher : IBlockPreviewRequestEnricher
    {
        /// <inheritdoc />
        public Task EnrichAsync(
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null) => Task.CompletedTask;
    }
}
