using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.TestSite.Services
{
    public class BlockPreviewResponseEnricher : IBlockPreviewResponseEnricher
    {
        public Task<string> EnrichAsync(
            string markup,
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null
        )
        {
            return Task.FromResult(
                $"<div>BlockEditorAlias: {blockEditorAlias}</div><div>contentElementAlias: {contentElementAlias}</div><div>contentUdi: {contentUdi}</div><div>settingsUdi: {settingsUdi}</div><div>blockIndex: {blockIndex}</div>{markup}"
            );
        }
    }
}
