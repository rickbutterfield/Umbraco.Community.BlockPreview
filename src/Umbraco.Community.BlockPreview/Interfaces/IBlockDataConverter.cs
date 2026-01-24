using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Service for converting and formatting block data.
    /// </summary>
    public interface IBlockDataConverter
    {
        /// <summary>
        /// Deserializes block grid data.
        /// </summary>
        /// <param name="blockData">The raw block data string.</param>
        /// <returns>The deserialized block editor data, or null if deserialization failed.</returns>
        BlockEditorData<BlockGridValue, BlockGridLayoutItem>? DeserializeBlockGrid(string? blockData);

        /// <summary>
        /// Deserializes block list data.
        /// </summary>
        /// <param name="blockData">The raw block data string.</param>
        /// <returns>The deserialized block editor data, or null if deserialization failed.</returns>
        BlockEditorData<BlockListValue, BlockListLayoutItem>? DeserializeBlockList(string? blockData);

        /// <summary>
        /// Deserializes rich text block data.
        /// </summary>
        /// <param name="blockData">The raw block data string.</param>
        /// <returns>The deserialized block editor data, or null if deserialization failed.</returns>
        BlockEditorData<RichTextBlockValue, RichTextBlockLayoutItem>? DeserializeRichText(string? blockData);

        /// <summary>
        /// Converts block item data to a published element.
        /// </summary>
        /// <param name="data">The block item data.</param>
        /// <param name="owner">The owner published element.</param>
        /// <returns>The converted published element.</returns>
        IPublishedElement ConvertToElement(BlockItemData data, IPublishedElement owner);

        /// <summary>
        /// Formats block data for preview rendering.
        /// </summary>
        /// <param name="blockData">The block data to format.</param>
        void FormatBlockData(List<BlockItemData>? blockData);
    }
}
