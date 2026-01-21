using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Cache.PropertyEditors;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Serialization;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Models;
using Umbraco.Extensions;
using static Umbraco.Cms.Core.Constants;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Service for rendering block previews.
    /// </summary>
    public class BlockPreviewService : IBlockPreviewService
    {
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly BlockPreviewOptions _options;
        private readonly ITypeFinder _typeFinder;
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly IDataTypeService _dataTypeService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly BlockEditorValues<BlockGridValue, BlockGridLayoutItem> _blockGridEditorValues;
        private readonly BlockEditorValues<BlockListValue, BlockListLayoutItem> _blockListEditorValues;
        private readonly BlockEditorValues<RichTextBlockValue, RichTextBlockLayoutItem> _richTextBlockEditorValues;
        private readonly JsonSerializerOptions _jsonSerializerOptions;
        private readonly ILogger<BlockPreviewService> _logger;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewService"/> class.
        /// </summary>
        /// <param name="tempDataProvider">The temp data provider.</param>
        /// <param name="viewComponentHelperWrapper">The view component helper wrapper.</param>
        /// <param name="razorViewEngine">The Razor view engine.</param>
        /// <param name="typeFinder">The type finder.</param>
        /// <param name="blockEditorConverter">The block editor converter.</param>
        /// <param name="viewComponentSelector">The view component selector.</param>
        /// <param name="publishedValueFallback">The published value fallback.</param>
        /// <param name="options">The block preview options.</param>
        /// <param name="jsonSerializer">The JSON serializer.</param>
        /// <param name="contentTypeService">The content type service.</param>
        /// <param name="dataTypeService">The data type service.</param>
        /// <param name="appCaches">The application caches.</param>
        /// <param name="webHostEnvironment">The web host environment.</param>
        /// <param name="elementTypeCache">The block editor element type cache.</param>
        /// <param name="logger">The logger.</param>
        public BlockPreviewService(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            ITypeFinder typeFinder,
            BlockEditorConverter blockEditorConverter,
            IViewComponentSelector viewComponentSelector,
            IPublishedValueFallback publishedValueFallback,
            IOptions<BlockPreviewOptions> options,
            IJsonSerializer jsonSerializer,
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            AppCaches appCaches,
            IWebHostEnvironment webHostEnvironment,
            IBlockEditorElementTypeCache elementTypeCache,
            ILogger<BlockPreviewService> logger)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _typeFinder = typeFinder;
            _blockEditorConverter = blockEditorConverter;
            _viewComponentSelector = viewComponentSelector;
            _publishedValueFallback = publishedValueFallback;
            _options = options.Value;
            _jsonSerializer = jsonSerializer;
            _dataTypeService = dataTypeService;
            _contentTypeService = contentTypeService;
            _webHostEnvironment = webHostEnvironment;
            _runtimeCache = appCaches.RuntimeCache;
            _logger = logger;

            _blockGridEditorValues = new BlockEditorValues<BlockGridValue, BlockGridLayoutItem>(new BlockGridEditorDataConverter(jsonSerializer), elementTypeCache, logger);
            _blockListEditorValues = new BlockEditorValues<BlockListValue, BlockListLayoutItem>(new BlockListEditorDataConverter(jsonSerializer), elementTypeCache, logger);
            _richTextBlockEditorValues = new BlockEditorValues<RichTextBlockValue, RichTextBlockLayoutItem>(new RichTextEditorBlockDataConverter(jsonSerializer), elementTypeCache, logger);

            _jsonSerializerOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters =
                {
                    new JsonStringEnumConverter(),
                    new JsonUdiConverter(),
                    new JsonUdiRangeConverter(),
                    new JsonObjectConverter(),
                    new JsonBlockValueConverter()
                }
            };
        }

        #region Public
        /// <summary>
        /// Renders a block grid block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <param name="blockEditorAlias">The block editor alias.</param>
        /// <param name="documentTypeUnique">The document type unique identifier.</param>
        /// <param name="contentKey">The content key.</param>
        /// <param name="settingsKey">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        public async Task<string> RenderGridBlock(
            string blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentKey = "",
            string? settingsKey = default,
            int? blockIndex = 0)
        {
            BlockEditorData<BlockGridValue, BlockGridLayoutItem>? blockValue = _blockGridEditorValues.DeserializeAndClean(blockData);
            if (blockValue == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockValue.BlockValue.ContentData.Any())
            {
                BlockGridEditorDataConverter converter = new BlockGridEditorDataConverter(_jsonSerializer);
                converter.TryDeserialize(blockData, out blockValue);
            }

            if (!Guid.TryParse(contentKey, out Guid contentGuidParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            Guid.TryParse(settingsKey!, out Guid settingsGuidParsed);

            FormatBlockData(blockValue?.BlockValue.ContentData);
            BlockItemData? contentData = blockValue?.BlockValue?.ContentData.FirstOrDefault(x => x.Key == contentGuidParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            bool hasNestedBlockGrid = contentData.Values.Any(x => x.EditorAlias == PropertyEditors.Aliases.BlockGrid);

            IPublishedElement contentElement = ConvertToElement(contentData, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsGuidParsed != Guid.Empty
                ? blockValue?.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == settingsGuidParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, content) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            BlockGridItem? blockInstance = CreateBlockInstance(
                BlockType.BlockGrid,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Key, settingsData?.Key
            ) as BlockGridItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            var layoutItems = blockValue?.BlockValue?.GetLayouts();
            BlockGridLayoutItem? matchingLayout = GetMatchingGridLayout(layoutItems!, blockInstance);

            IContentType? documentType = GetContentType(documentTypeUnique);
            if (documentType == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidDocumentType);

            IPropertyType? property = documentType.PropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));
            if (property == null)
            {
                property = documentType.CompositionPropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));

                if (property == null)
                    return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidPropertyType);
            }

            IDataType? dataType = await GetDataType(property.DataTypeKey);
            if (dataType == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidDataType);

            BlockGridConfiguration? config = dataType.ConfigurationAs<BlockGridConfiguration>();
            if (config == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockGridConfiguration);

            BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlockConfig = config.Blocks.FirstOrDefault(x => x.ContentElementTypeKey == contentData.ContentTypeKey);
            if (matchingBlockConfig == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidMatchingBlockGridConfiguration);

            BlockPreviewContext previewContext = new BlockPreviewContext(
               controllerContext,
               content,
               contentElement.ContentType.Alias,
               BlockType.BlockGrid,
               blockIndex,
               matchingBlockConfig);

            ConfigureBlockInstanceAreas(blockValue!, blockInstance, config, matchingBlockConfig, matchingLayout!, content);

            previewContext.ViewData = await CreateViewDataAsync(blockInstance, previewContext, hasNestedBlockGrid);
            return await GetMarkup(previewContext);
        }

        /// <summary>
        /// Renders a block list block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <param name="blockEditorAlias">The block editor alias.</param>
        /// <param name="documentTypeUnique">The document type unique identifier.</param>
        /// <param name="contentKey">The content key.</param>
        /// <param name="settingsKey">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        public async Task<string> RenderListBlock(
            string blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentKey = "",
            string? settingsKey = default,
            int? blockIndex = 0)
        {
            var blockValue = _blockListEditorValues.DeserializeAndClean(blockData);
            if (blockValue == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockValue.BlockValue.ContentData.Any())
            {
                BlockListEditorDataConverter converter = new BlockListEditorDataConverter(_jsonSerializer);
                converter.TryDeserialize(blockData, out blockValue);
            }

            if (!Guid.TryParse(contentKey, out Guid contentGuidParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            Guid.TryParse(settingsKey!, out Guid settingsGuidParsed);

            FormatBlockData(blockValue?.BlockValue.ContentData);
            BlockItemData? contentData = blockValue?.BlockValue?.ContentData.FirstOrDefault(x => x.Key == contentGuidParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement contentElement = ConvertToElement(contentData, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsGuidParsed != Guid.Empty
                ? blockValue?.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == settingsGuidParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, content) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            BlockListItem? blockInstance = CreateBlockInstance(
                BlockType.BlockList,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Key, settingsData?.Key
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            BlockPreviewContext previewContext = new BlockPreviewContext(
               controllerContext,
               content,
               contentElement.ContentType.Alias,
               BlockType.BlockList,
               blockIndex);

            previewContext.ViewData = await CreateViewDataAsync(blockInstance, previewContext);
            return await GetMarkup(previewContext);
        }

        /// <summary>
        /// Renders a rich text block.
        /// </summary>
        /// <param name="blockData">The block data.</param>
        /// <param name="content">The published content.</param>
        /// <param name="controllerContext">The controller context.</param>
        /// <returns>The rendered HTML.</returns>
        public async Task<string> RenderRichTextBlock(
            string blockData,
            IPublishedContent content,
            ControllerContext controllerContext)
        {
            var blockValue = _richTextBlockEditorValues.DeserializeAndClean(blockData);
            if (blockValue == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockValue.BlockValue.ContentData.Any())
            {
                RichTextEditorBlockDataConverter converter = new RichTextEditorBlockDataConverter(_jsonSerializer);
                converter.TryDeserialize(blockData, out blockValue);
            }

            FormatBlockData(blockValue?.BlockValue.ContentData);
            BlockItemData? contentData = blockValue?.BlockValue?.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = blockValue?.BlockValue.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, content) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            RichTextBlockItem? blockInstance = CreateBlockInstance(
                BlockType.RichText,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Key, settingsData?.Key
            ) as RichTextBlockItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            BlockPreviewContext previewContext = new BlockPreviewContext(
                controllerContext,
                content,
                contentElement.ContentType.Alias,
                BlockType.RichText);

            previewContext.ViewData = await CreateViewDataAsync(blockInstance, previewContext);
            return await GetMarkup(previewContext);
        }

        /// <inheritdoc/>
        [Obsolete("Use the overload without blockEditorAlias and documentTypeUnique parameters.")]
        public Task<string> RenderRichTextBlock(
            string blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias,
            Guid documentTypeUnique)
            => RenderRichTextBlock(blockData, content, controllerContext);

        /// <summary>
        /// Retrieves the path to the stylesheet associated with the specified block type.
        /// </summary>
        /// <remarks>The method returns a stylesheet path based on the block type. This method is obsolete; use <see cref="GetStylesheetPaths"/> instead.</remarks>
        /// <param name="blockType">The type of block for which the stylesheet path is requested.</param>
        /// <param name="content">The content associated with the block.</param>
        /// <param name="controllerContext">The context of the controller handling the request.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the stylesheet path as a string,
        /// or <see langword="null"/> if no stylesheet is associated with the specified block type.</returns>
        [Obsolete("Use GetStylesheetPaths instead to support multiple stylesheets.")]
        public virtual async Task<string?> GetStylesheetPath(BlockType blockType, IPublishedContent content, ControllerContext controllerContext)
        {
            var paths = await GetStylesheetPaths(blockType, content, controllerContext);
            return paths?.FirstOrDefault();
        }

        /// <summary>
        /// Retrieves the paths to the stylesheets associated with the specified block type.
        /// </summary>
        /// <remarks>The method returns stylesheet paths based on the block type, combining both the legacy Stylesheet property and the new Stylesheets collection.</remarks>
        /// <param name="blockType">The type of block for which the stylesheet paths are requested.</param>
        /// <param name="content">The content associated with the block.</param>
        /// <param name="controllerContext">The context of the controller handling the request.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of stylesheet paths,
        /// or <see langword="null"/> if no stylesheets are associated with the specified block type.</returns>
        public virtual Task<IEnumerable<string>?> GetStylesheetPaths(BlockType blockType, IPublishedContent content, ControllerContext controllerContext)
        {
            BlockTypeSettings? settings = blockType switch
            {
                BlockType.BlockGrid => _options.BlockGrid,
                BlockType.BlockList => _options.BlockList,
                BlockType.RichText => _options.RichText,
                _ => null
            };

            if (settings == null)
                return Task.FromResult<IEnumerable<string>?>(null);

            var stylesheets = new List<string>();

            // Add legacy single stylesheet if specified
#pragma warning disable CS0618 // Type or member is obsolete
            if (!string.IsNullOrWhiteSpace(settings.Stylesheet))
                stylesheets.Add(settings.Stylesheet);
#pragma warning restore CS0618 // Type or member is obsolete

            // Add multiple stylesheets if specified
            if (settings.Stylesheets?.Any() == true)
                stylesheets.AddRange(settings.Stylesheets.Where(s => !string.IsNullOrWhiteSpace(s)));

            // Return distinct stylesheets to avoid duplicates
            var result = stylesheets.Distinct().ToList();
            return Task.FromResult<IEnumerable<string>?>(result.Any() ? result : null);
        }
        #endregion

        #region Private
        private Type? FindBlockType(string? contentTypeAlias)
        {
            if (string.IsNullOrEmpty(contentTypeAlias))
                return null;

            var cacheKey = string.Format(Constants.CacheKeys.BlockType, contentTypeAlias);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _typeFinder
                    .FindClassesWithAttribute<PublishedModelAttribute>()
                    .FirstOrDefault(x => x.GetCustomAttribute<PublishedModelAttribute>(false)?.ContentTypeAlias == contentTypeAlias);
            }, CacheDuration);
        }

        private IContentType? GetContentType(Guid documentTypeUnique)
        {
            var cacheKey = string.Format(Constants.CacheKeys.ContentType, documentTypeUnique);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _contentTypeService.Get(documentTypeUnique);
            }, CacheDuration);
        }

        private async Task<IDataType?> GetDataType(Guid dataTypeKey)
        {
            var cacheKey = string.Format(Constants.CacheKeys.DataType, dataTypeKey);
            return await _runtimeCache.GetCacheItemAsync(cacheKey, async () =>
            {
                IDataType? dataType = await _dataTypeService.GetAsync(dataTypeKey);
                return dataType;
            }, CacheDuration);
        }

        private IPublishedElement ConvertToElement(BlockItemData data, IPublishedElement owner)
        {
            if (data != null)
            {
                for (int i = 0; i < data.Values.Count(); i++)
                {
                    var property = data.Values.ElementAt(i);
                    var value = property.Value;
                    string? propertyAsString = value?.ToString();

                    if (property.EditorAlias == PropertyEditors.Aliases.RichText)
                    {
                        if (RichTextPropertyEditorHelper.TryParseRichTextEditorValue(value, _jsonSerializer, _logger, out RichTextEditorValue? richTextEditorValue))
                        {
                            var blockValue = _richTextBlockEditorValues.DeserializeAndClean(_jsonSerializer.Serialize(richTextEditorValue.Blocks));
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                richTextEditorValue.Blocks = blockValue.BlockValue;

                                property.Value = JsonSerializer.Serialize(richTextEditorValue, _jsonSerializerOptions);
                            }
                        }
                    }
                    if (property.EditorAlias == PropertyEditors.Aliases.BlockGrid)
                    {
                        var blockValue = _blockGridEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }
                    if (property.EditorAlias == PropertyEditors.Aliases.BlockList)
                    {
                        var blockValue = _blockListEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }
                }
            }

            var element = _blockEditorConverter.ConvertToElement(owner, data!, PropertyCacheLevel.None, preview: true);
            if (element == null)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        private void FormatBlockData(List<BlockItemData>? blockData)
        {
            if (blockData == null || blockData.Count == 0)
                return;

            foreach (var contentData in blockData)
            {
                foreach (var propertyData in contentData.Values)
                {
                    if (propertyData.EditorAlias == PropertyEditors.Aliases.ContentPicker)
                    {
                        if (Guid.TryParse(propertyData.Value?.ToString(), out Guid parsedGuid))
                        {
                            propertyData.Value = StringUdi.Create("document", parsedGuid).UriValue.ToString();
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.RichText)
                    {
                        if (RichTextPropertyEditorHelper.TryParseRichTextEditorValue(propertyData.Value, _jsonSerializer, _logger, out RichTextEditorValue? richTextEditorValue))
                        {
                            var blockValue = _richTextBlockEditorValues.DeserializeAndClean(_jsonSerializer.Serialize(richTextEditorValue.Blocks));
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                richTextEditorValue.Blocks = blockValue.BlockValue;

                                propertyData.Value = JsonSerializer.Serialize(richTextEditorValue, _jsonSerializerOptions);

                                propertyData.Value = propertyData.Value.ToString()?.Replace("\"Layout\"", "\"layout\"");
                            }
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.BlockGrid)
                    {
                        string? propertyAsString = propertyData.Value?.ToString();
                        var blockValue = _blockGridEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            propertyData.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.BlockList)
                    {
                        string? propertyAsString = propertyData.Value?.ToString();
                        var blockValue = _blockListEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            propertyData.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }

                    else if (propertyData.Value is JsonObject jsonObject)
                    {
                        propertyData.Value = JsonSerializer.Serialize(jsonObject, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is JsonArray jsonArray)
                    {
                        if (propertyData.EditorAlias == PropertyEditors.Aliases.MultiNodeTreePicker)
                        {
                            List<EditorEntityReference>? convertedReferences = JsonSerializer.Deserialize<List<EditorEntityReference>>(propertyData.Value.ToString()!);
                            IEnumerable<Udi>? convertedData = convertedReferences?.Select(x => StringUdi.Create(x.Type, x.Unique));
                            string? stringifiedData = string.Join(",", convertedData!);
                            propertyData.Value = stringifiedData;
                        }

                        else propertyData.Value = JsonSerializer.Serialize(jsonArray, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is List<string> list)
                    {
                        propertyData.Value = JsonSerializer.Serialize(list, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is string str)
                    {
                        propertyData.Value = str;
                    }
                }
            }
        }

        private BlockGridLayoutItem? GetMatchingGridLayout(IEnumerable<BlockGridLayoutItem> layoutItems, BlockGridItem? blockInstance)
        {
            if (layoutItems == null || blockInstance == null)
                return null;

            foreach (var layoutItem in layoutItems)
            {
                if (layoutItem.ContentKey == blockInstance.ContentKey)
                {
                    blockInstance.RowSpan = layoutItem.RowSpan!.Value;
                    blockInstance.ColumnSpan = layoutItem.ColumnSpan!.Value;
                    return layoutItem;
                }
                else
                {
                    foreach (var area in layoutItem.Areas)
                    {
                        foreach (var item in area.Items)
                        {
                            if (item.ContentKey != blockInstance.ContentKey) continue;
                            blockInstance.RowSpan = item.RowSpan!.Value;
                            blockInstance.ColumnSpan = item.ColumnSpan!.Value;
                            return layoutItem;
                        }
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// Creates and initializes a <see cref="ViewDataDictionary"/> for use in rendering a block preview.
        /// </summary>
        /// <param name="typedBlockInstance">The typed block instance to be set as the model in the view data. Can be <see langword="null"/>.</param>
        /// <param name="context">The context containing information about the block being previewed.</param>
        /// <param name="hasNestedBlockGrid">Indicates whether the block contains a nested block grid.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ViewDataDictionary"/>
        /// containing the model and additional metadata for rendering the block preview.</returns>
        /// <remarks>
        /// Override this method to customize the view data for block previews asynchronously.
        /// The default implementation calls the synchronous <see cref="CreateViewData"/> method for backward compatibility.
        /// </remarks>
        protected virtual Task<ViewDataDictionary> CreateViewDataAsync(object? typedBlockInstance, BlockPreviewContext context, bool? hasNestedBlockGrid = false)
        {
#pragma warning disable CS0618 // Type or member is obsolete
            return Task.FromResult(CreateViewData(typedBlockInstance, context, hasNestedBlockGrid));
#pragma warning restore CS0618
        }

        /// <summary>
        /// Creates and initializes a <see cref="ViewDataDictionary"/> for use in rendering a block preview.
        /// </summary>
        /// <param name="typedBlockInstance">The typed block instance to be set as the model in the view data. Can be <see langword="null"/>.</param>
        /// <param name="context">The context containing information about the block being previewed.</param>
        /// <param name="hasNestedBlockGrid">Indicates whether the block contains a nested block grid.</param>
        /// <returns>A <see cref="ViewDataDictionary"/> containing the model and additional metadata for rendering the block
        /// preview.</returns>
        [Obsolete("Use CreateViewDataAsync instead. This method will be removed in a future version.")]
        protected virtual ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockPreviewContext context, bool? hasNestedBlockGrid = false)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;
            viewData["blockIndex"] = context.BlockIndex;

            if (context.BlockType == BlockType.BlockGrid)
            {
                viewData["blockGridPreview"] = true;

                if (context.BlockGridBlockConfig != null && context.BlockGridBlockConfig.Areas.Any())
                {
                    viewData["matchingBlockConfig"] = context.BlockGridBlockConfig;
                }

                if (hasNestedBlockGrid == true)
                {
                    viewData["blockGridNested"] = hasNestedBlockGrid;
                }
            }

            return viewData;
        }

        private object? CreateBlockInstance(BlockType blockType, Type? contentBlockType, IPublishedElement? contentElement, Type? settingsBlockType, IPublishedElement? settingsElement, Guid? contentKey, Guid? settingsGuid)
        {
            if (contentBlockType != null)
            {
                var contentInstance = Activator.CreateInstance(contentBlockType, contentElement, _publishedValueFallback);
                var settingsInstance = settingsBlockType != null ? Activator.CreateInstance(settingsBlockType, settingsElement, _publishedValueFallback) : null;

                Type blockItemType;
                if (blockType == BlockType.BlockGrid)
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(BlockGridItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(BlockGridItem<>).MakeGenericType(contentBlockType);
                }
                else if (blockType == BlockType.RichText)
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(RichTextBlockItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(RichTextBlockItem<>).MakeGenericType(contentBlockType);
                }
                else
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(BlockListItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(BlockListItem<>).MakeGenericType(contentBlockType);
                }

                return Activator.CreateInstance(blockItemType, contentKey, contentInstance, settingsGuid, settingsInstance);
            }

            return null;
        }

        private async Task<string> GetMarkup(BlockPreviewContext context)
        {
            // If using a ViewComponent, we don't know if it has been set up with a
            // PascalCase name (default ViewComponent behaviour) or a camelCase name
            // (using the [ViewComponent] decorator with the ModelsBuilder `ModelTypeAlias`.
            // This code checks for both so that ViewComponents are resolved in both cases.  
            var viewComponent = _viewComponentSelector.SelectComponent(context.ContentAlias?.ToPascalCase());

            if (viewComponent == null)
            {
                viewComponent = _viewComponentSelector.SelectComponent(context.ContentAlias?.ToCamelCase());
            }

            return viewComponent != null
                ? await GetMarkupFromViewComponent(viewComponent, context)
                : await GetMarkupFromPartial(context);
        }

        private async Task<string> GetMarkupFromPartial(BlockPreviewContext context)
        {
            var viewResult = GetViewResult(context);

            if (viewResult == null)
            {
                viewResult =
                    _razorViewEngine.FindView(context.ControllerContext, context.ContentAlias!, false) ??
                    _razorViewEngine.FindView(context.ControllerContext, context.ContentAlias?.ToPascalCase()!, false);

                if (!viewResult.Success)
                    return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));
            }

            if (viewResult.View == null)
                return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));

            var actionContext = new ActionContext(context.ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());

            await using var sw = new StringWriter();

            if (context.ViewData != null)
            {
                var viewContext = new ViewContext(actionContext, viewResult.View, context.ViewData,
                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);
            }

            return sw.ToString();
        }

        private async Task<string> GetMarkupFromViewComponent(ViewComponentDescriptor viewComponent, BlockPreviewContext context)
        {
            await using var sw = new StringWriter();
            var viewContext = new ViewContext(
                context.ControllerContext,
                new FakeView(),
                context.ViewData,
                new TempDataDictionary(context.ControllerContext.HttpContext, _tempDataProvider),
                sw,
                new HtmlHelperOptions());

            _viewComponentHelperWrapper.Contextualize(viewContext);

            var result = await _viewComponentHelperWrapper.InvokeAsync(viewComponent.TypeInfo.AsType(), context.ViewData.Model);
            result.WriteTo(sw, HtmlEncoder.Default);
            return sw.ToString();
        }

        private void ConfigureBlockInstanceAreas(
            BlockEditorData<BlockGridValue, BlockGridLayoutItem> blockValue,
            BlockGridItem blockInstance,
            BlockGridConfiguration config,
            BlockGridConfiguration.BlockGridBlockConfiguration matchingBlock,
            BlockGridLayoutItem layoutItem,
            IPublishedContent content)
        {
            blockInstance.AreaGridColumns = matchingBlock.AreaGridColumns ?? 12;
            blockInstance.GridColumns = config.GridColumns ?? 12;

            var blockConfigAreaMap = matchingBlock.Areas.ToDictionary(area => area.Key);
            if (layoutItem == null || blockConfigAreaMap == null || !blockConfigAreaMap.Any())
                return;

            blockInstance.Areas = layoutItem.Areas.Select(area =>
            {
                if (!blockConfigAreaMap.TryGetValue(area.Key, out var areaConfig))
                    return null;

                var items = area.Items.Select(item =>
                {
                    BlockItemData? areaContentData = blockValue.BlockValue?.ContentData.FirstOrDefault(x => x.Key == item.ContentKey);
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, content);

                    BlockItemData? areaSettingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == item.ContentKey);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, content) : default;

                    return new BlockGridItem(item.ContentKey, areaContentElement!, item.SettingsKey, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(new List<BlockGridItem>(area.Items.Count()), areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToArray();
        }

        /// <summary>
        /// Attempts to locate a view based on the provided block preview context.
        /// </summary>
        /// <remarks>This method searches for views using the view locations specified in the options for
        /// the given block type.</remarks>
        /// <param name="context">The context containing information about the block preview, including the content alias and block type.</param>
        /// <returns>A <see cref="ViewEngineResult"/> representing the located view if a matching view is found; otherwise, <see
        /// langword="null"/>.</returns>
        protected virtual ViewEngineResult? GetViewResult(BlockPreviewContext context)
        {
            if (string.IsNullOrEmpty(context.ContentAlias))
                return null;

            var viewPaths = _options.GetViewLocations(context.BlockType);

            if (viewPaths == null || !viewPaths.Any())
                return null;

            ViewEngineResult? viewResult = null;
            string appRoot = _webHostEnvironment.ContentRootPath;

            foreach (var viewPath in viewPaths)
            {
                string baseViewPath = viewPath.TrimStart($"~{Path.DirectorySeparatorChar}").TrimStart("/");

                var pathNonPascal = string.Format(baseViewPath, context.ContentAlias ?? "");
                var viewPathNonPascal = Path.Combine(appRoot, pathNonPascal);

                if (System.IO.File.Exists(viewPathNonPascal))
                {
                    viewResult = _razorViewEngine.GetView("", pathNonPascal, false);

                    if (viewResult.Success)
                        return viewResult;
                }

                else
                {
                    var pathPascal = string.Format(baseViewPath, context.ContentAlias?.ToPascalCase() ?? "");
                    var viewPathPascal = Path.Combine(appRoot, pathPascal);

                    if (System.IO.File.Exists(viewPathPascal))
                    {
                        viewResult = _razorViewEngine.GetView("", pathPascal, false);

                        if (viewResult.Success)
                            return viewResult;
                    }
                }
                return null;
            }

            return null;
        }

        private sealed class FakeView : IView
        {
            public string Path => string.Empty;

            public Task RenderAsync(ViewContext context)
            {
                return Task.CompletedTask;
            }
        }
        #endregion
    }
}