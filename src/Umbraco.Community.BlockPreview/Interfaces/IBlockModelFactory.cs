using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Factory for creating typed block model instances.
    /// </summary>
    public interface IBlockModelFactory
    {
        /// <summary>
        /// Creates a typed content or settings model instance.
        /// </summary>
        /// <param name="modelType">The model type to instantiate.</param>
        /// <param name="element">The published element containing the data.</param>
        /// <returns>The typed model instance.</returns>
        object CreateModel(Type modelType, IPublishedElement element);

        /// <summary>
        /// Creates a typed block item (BlockGridItem, BlockListItem, or RichTextBlockItem).
        /// </summary>
        /// <param name="blockType">The type of block editor.</param>
        /// <param name="contentType">The content model type.</param>
        /// <param name="contentInstance">The content model instance.</param>
        /// <param name="settingsType">The settings model type, or null if no settings.</param>
        /// <param name="settingsInstance">The settings model instance, or null if no settings.</param>
        /// <param name="contentKey">The content key.</param>
        /// <param name="settingsKey">The settings key, or null if no settings.</param>
        /// <returns>The typed block item instance, or null if creation failed.</returns>
        object? CreateBlockItem(
            BlockType blockType,
            Type contentType,
            object contentInstance,
            Type? settingsType,
            object? settingsInstance,
            Guid contentKey,
            Guid? settingsKey);

        /// <summary>
        /// Creates a complete typed block instance including content model, settings model, and block item.
        /// </summary>
        /// <param name="blockType">The type of block editor.</param>
        /// <param name="contentType">The content model type.</param>
        /// <param name="contentElement">The content published element.</param>
        /// <param name="settingsType">The settings model type, or null if no settings.</param>
        /// <param name="settingsElement">The settings published element, or null if no settings.</param>
        /// <param name="contentKey">The content key.</param>
        /// <param name="settingsKey">The settings key, or null if no settings.</param>
        /// <returns>The typed block item instance, or null if contentType is null.</returns>
        object? CreateBlockInstance(
            BlockType blockType,
            Type? contentType,
            IPublishedElement? contentElement,
            Type? settingsType,
            IPublishedElement? settingsElement,
            Guid contentKey,
            Guid? settingsKey);
    }
}
