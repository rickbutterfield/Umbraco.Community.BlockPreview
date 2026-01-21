using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Interface for enriching HTTP responses during block preview rendering.
    /// Implementations can add custom data or modify the block preview markup based on block-specific information.
    /// </summary>
    public interface IBlockPreviewResponseEnricher
    {
        /// <summary>
        /// Enriches the HTML markup after preview rendering.
        /// </summary>
        /// <param name="markup">The HTML markup of the block being rendered.</param>
        /// <param name="httpContext">The current HTTP context.</param>
        /// <param name="content">The published content being rendered, if available.</param>
        /// <param name="blockEditorAlias">The alias of the block editor (e.g., Block List, Block Grid).</param>
        /// <param name="contentElementAlias">The alias of the content element type being rendered.</param>
        /// <param name="contentUdi">The UDI (Umbraco Document Identifier) of the content element.</param>
        /// <param name="settingsUdi">The UDI of the settings element, if applicable.</param>
        /// <param name="blockIndex">The zero-based index of the block within its container.</param>
        /// <returns>A task that returns the enriched HTML markup.</returns>
        Task<string> EnrichAsync(
            string markup,
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null
        );
    }
}
