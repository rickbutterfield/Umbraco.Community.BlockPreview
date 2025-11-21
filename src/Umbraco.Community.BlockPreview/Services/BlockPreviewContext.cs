using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Represents the context for a block preview, providing information about the block and its rendering environment.
    /// </summary>
    public class BlockPreviewContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewContext"/> class.
        /// </summary>
        /// <param name="controllerContext">The controller context for the current request.</param>
        /// <param name="content">The published content associated with the block.</param>
        /// <param name="alias">The alias of the content block.</param>
        /// <param name="blockType">The type of the block (e.g., BlockGrid or BlockList).</param>
        /// <param name="blockIndex">The index of the block within its container, if applicable.</param>
        /// <param name="blockGridBlockConfig">The configuration for the block grid block, if applicable.</param>
        internal BlockPreviewContext(
            ControllerContext controllerContext,
            IPublishedContent content,
            string alias,
            BlockType blockType,
            int? blockIndex = null,
            BlockGridConfiguration.BlockGridBlockConfiguration? blockGridBlockConfig = null)
        {
            ControllerContext = controllerContext;
            Content = content;
            ContentAlias = alias;
            BlockType = blockType;
            BlockIndex = blockIndex;
            BlockGridBlockConfig = blockGridBlockConfig;
        }

        /// <summary>
        /// Gets or sets the controller context for the current request.
        /// </summary>
        public ControllerContext ControllerContext { get; set; }

        /// <summary>
        /// Gets or sets the published content associated with the block.
        /// </summary>
        public IPublishedContent Content { get; set; }

        /// <summary>
        /// Gets or sets the alias of the content block.
        /// </summary>
        public string ContentAlias { get; set; }

        /// <summary>
        /// Gets or sets the type of the block (e.g., BlockGrid or BlockList).
        /// </summary>
        public BlockType BlockType { get; set; }

        /// <summary>
        /// Gets or sets the view data dictionary for the block.
        /// </summary>
        public ViewDataDictionary? ViewData { get; set; }

        /// <summary>
        /// Gets the index of the block within its container, if applicable.
        /// </summary>
        public int? BlockIndex { get; }

        /// <summary>
        /// Gets or sets the configuration for the block grid block, if applicable.
        /// </summary>
        public BlockGridConfiguration.BlockGridBlockConfiguration? BlockGridBlockConfig { get; set; }
    }
}