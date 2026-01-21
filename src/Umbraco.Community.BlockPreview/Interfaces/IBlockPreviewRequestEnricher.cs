using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Interface for enriching HTTP requests during block preview rendering.
    /// Implementations can add custom data or modify the request context based on block-specific information.
    /// </summary>
    public interface IBlockPreviewRequestEnricher
    {
        /// <summary>
        /// Enriches the HTTP context with block-specific information during preview rendering.
        /// </summary>
        /// <param name="httpContext">The current HTTP context to be enriched.</param>
        /// <param name="content">The published content being rendered, if available.</param>
        /// <param name="blockEditorAlias">The alias of the block editor (e.g., Block List, Block Grid).</param>
        /// <param name="contentElementAlias">The alias of the content element type being rendered.</param>
        /// <param name="contentUdi">The UDI (Umbraco Document Identifier) of the content element.</param>
        /// <param name="settingsUdi">The UDI of the settings element, if applicable.</param>
        /// <param name="blockIndex">The zero-based index of the block within its container.</param>
        /// <returns>A task representing the asynchronous enrichment operation.</returns>
        Task EnrichAsync(
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null);
    }
}
