using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Service for rendering block previews.
    /// </summary>
    public interface IBlockPreviewService
    {
        /// <summary>
        /// Renders a block grid block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <param name="blockEditorAlias">The block editor alias.</param>
        /// <param name="documentTypeUnique">The document type unique identifier.</param>
        /// <param name="contentUdi">The content key.</param>
        /// <param name="settingsUdi">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        Task<string> RenderGridBlock(BlockValue blockData, IPublishedContent content, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default, int? blockIndex = 0);

        /// <summary>
        /// Renders a block list block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <param name="blockEditorAlias">The block editor alias.</param>
        /// <param name="documentTypeUnique">The document type unique identifier.</param>
        /// <param name="contentUdi">The content key.</param>
        /// <param name="settingsUdi">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        Task<string> RenderListBlock(BlockValue blockData, IPublishedContent content, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default, int? blockIndex = 0);

        /// <summary>
        /// Renders a rich text block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <returns>The rendered HTML.</returns>
        Task<string> RenderRichTextBlock(BlockValue blockData, IPublishedContent content, ControllerContext controllerContext);
    }
}
