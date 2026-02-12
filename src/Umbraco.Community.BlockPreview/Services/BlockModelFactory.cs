using System.Collections.Concurrent;
using System.Reflection;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Factory for creating typed block model instances with constructor caching.
    /// </summary>
    public class BlockModelFactory : IBlockModelFactory
    {
        private readonly IPublishedValueFallback _publishedValueFallback;

        private static readonly ConcurrentDictionary<Type, ConstructorInfo> _modelConstructorCache = new();
        private static readonly ConcurrentDictionary<Type, ConstructorInfo> _blockItemConstructorCache = new();

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockModelFactory"/> class.
        /// </summary>
        /// <param name="publishedValueFallback">The published value fallback.</param>
        public BlockModelFactory(IPublishedValueFallback publishedValueFallback)
        {
            _publishedValueFallback = publishedValueFallback;
        }

        /// <inheritdoc/>
        public object CreateModel(Type modelType, IPublishedElement element)
        {
            var ctor = _modelConstructorCache.GetOrAdd(modelType, GetModelConstructor);
            return ctor.Invoke(new object[] { element, _publishedValueFallback });
        }

        /// <inheritdoc/>
        public object? CreateBlockItem(
            BlockType blockType,
            Type contentType,
            object contentInstance,
            Type? settingsType,
            object? settingsInstance,
            Guid contentKey,
            Guid? settingsKey)
        {
            var blockItemType = CreateBlockItemType(blockType, contentType, settingsType);
            var ctor = _blockItemConstructorCache.GetOrAdd(blockItemType, GetBlockItemConstructor);

            // Block item constructors expect Udi, not Guid
            var contentUdi = Udi.Create(Umbraco.Cms.Core.Constants.UdiEntityType.Element, contentKey);
            var settingsUdi = settingsKey.HasValue
                ? Udi.Create(Umbraco.Cms.Core.Constants.UdiEntityType.Element, settingsKey.Value)
                : null;

            return ctor.Invoke(new object?[] { contentUdi, contentInstance, settingsUdi, settingsInstance });
        }

        /// <inheritdoc/>
        public object? CreateBlockInstance(
            BlockType blockType,
            Type? contentType,
            IPublishedElement? contentElement,
            Type? settingsType,
            IPublishedElement? settingsElement,
            Guid contentKey,
            Guid? settingsKey)
        {
            if (contentType == null || contentElement == null)
                return null;

            var contentInstance = CreateModel(contentType, contentElement);
            var settingsInstance = settingsType != null && settingsElement != null
                ? CreateModel(settingsType, settingsElement)
                : null;

            return CreateBlockItem(
                blockType,
                contentType,
                contentInstance,
                settingsType,
                settingsInstance,
                contentKey,
                settingsKey);
        }

        private static Type CreateBlockItemType(BlockType blockType, Type contentType, Type? settingsType)
        {
            return (blockType, settingsType) switch
            {
                (BlockType.BlockGrid, not null) => typeof(BlockGridItem<,>).MakeGenericType(contentType, settingsType),
                (BlockType.BlockGrid, null) => typeof(BlockGridItem<>).MakeGenericType(contentType),
                (BlockType.BlockList, not null) => typeof(BlockListItem<,>).MakeGenericType(contentType, settingsType),
                (BlockType.BlockList, null) => typeof(BlockListItem<>).MakeGenericType(contentType),
                (BlockType.RichText, not null) => typeof(RichTextBlockItem<,>).MakeGenericType(contentType, settingsType),
                (BlockType.RichText, null) => typeof(RichTextBlockItem<>).MakeGenericType(contentType),
                _ => throw new ArgumentOutOfRangeException(nameof(blockType), blockType, "Unknown block type")
            };
        }

        private static ConstructorInfo GetModelConstructor(Type type)
        {
            var ctor = type.GetConstructor(new[] { typeof(IPublishedElement), typeof(IPublishedValueFallback) });
            return ctor ?? throw new InvalidOperationException(
                $"Type {type.Name} does not have the expected constructor (IPublishedElement, IPublishedValueFallback).");
        }

        private static ConstructorInfo GetBlockItemConstructor(Type type)
        {
            // Block items have constructor: (Udi contentUdi, TContent content, Udi? settingsUdi, TSettings? settings)
            var ctor = type.GetConstructors().FirstOrDefault(c => c.GetParameters().Length == 4);
            return ctor ?? throw new InvalidOperationException(
                $"Type {type.Name} does not have the expected 4-parameter constructor.");
        }
    }
}
