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
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Encodings.Web;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Converters;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Helpers;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;
using static Umbraco.Cms.Core.Constants.PropertyEditors;

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
        private readonly IDataTypeService _dataTypeService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IJsonSerializer _jsonSerializer;

        private readonly BlockEditorValues _blockGridEditorValues;
        private readonly BlockEditorValues _blockListEditorValues;
        private readonly BlockEditorValues _richTextBlockEditorValues;

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
            ILogger<BlockPreviewService> logger,
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            ITypeFinder typeFinder,
            BlockEditorConverter blockEditorConverter,
            IViewComponentSelector viewComponentSelector,
            IPublishedValueFallback publishedValueFallback,
            IOptions<BlockPreviewOptions> options,
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            AppCaches appCaches,
            IWebHostEnvironment webHostEnvironment,
            IBlockEditorElementTypeCache elementTypeCache,
            IJsonSerializer jsonSerializer)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _typeFinder = typeFinder;
            _blockEditorConverter = blockEditorConverter;
            _viewComponentSelector = viewComponentSelector;
            _publishedValueFallback = publishedValueFallback;
            _options = options.Value;
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
            _webHostEnvironment = webHostEnvironment;
            _runtimeCache = appCaches.RuntimeCache;
            _jsonSerializer = jsonSerializer;

            _blockGridEditorValues = new BlockEditorValues(new BlockGridEditorDataConverter(jsonSerializer), elementTypeCache, logger);
            _blockListEditorValues = new BlockEditorValues(new BlockListEditorDataConverter(), elementTypeCache, logger);
            _richTextBlockEditorValues = new BlockEditorValues(new RichTextEditorBlockDataConverter(), elementTypeCache, logger);
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
        /// <param name="contentUdi">The content key.</param>
        /// <param name="settingsUdi">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        public async Task<string> RenderGridBlock(
            BlockValue blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default,
            int? blockIndex = 0)
        {
            var blockValue = _blockGridEditorValues.DeserializeAndClean(blockData);
            if (blockValue == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockValue.BlockValue.ContentData.Any())
            {
                BlockGridEditorDataConverter converter = new BlockGridEditorDataConverter(_jsonSerializer);
                converter.TryDeserialize(_jsonSerializer.Serialize(blockData), out blockValue);
            }

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            FormatBlockData(blockValue?.BlockValue.ContentData);
            BlockItemData? contentData = blockValue?.BlockValue.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockValue?.BlockValue.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            BlockGridItem? blockInstance = CreateBlockInstance(
                BlockType.BlockGrid,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Udi, settingsData?.Udi
            ) as BlockGridItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            List<string>? layoutItems = blockValue?.BlockValue.Layout.FirstOrDefault().Value.Select(layout => layout.ToString()).ToList();
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

            IDataType? dataType = GetDataType(property.DataTypeKey);
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

            ConfigureBlockInstanceAreas(blockValue, blockInstance, config, matchingBlockConfig, matchingLayout!, content);

            previewContext.ViewData = CreateViewData(blockInstance, previewContext);
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
        /// <param name="contentUdi">The content key.</param>
        /// <param name="settingsUdi">The settings key.</param>
        /// <param name="blockIndex">The block index.</param>
        /// <returns>The rendered HTML.</returns>
        public async Task<string> RenderListBlock(
            BlockValue blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default,
            int? blockIndex = 0)
        {
            var blockValue = _blockListEditorValues.DeserializeAndClean(blockData);
            if (blockValue == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockValue.BlockValue.ContentData.Any())
            {
                BlockListEditorDataConverter converter = new BlockListEditorDataConverter();
                converter.TryDeserialize(JsonConvert.SerializeObject(blockData), out blockValue);
            }

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            FormatBlockData(blockValue?.BlockValue.ContentData);
            BlockItemData? contentData = blockValue?.BlockValue.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockValue?.BlockValue.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            BlockListItem? blockInstance = CreateBlockInstance(
                BlockType.BlockList,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Udi, settingsData?.Udi
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            BlockPreviewContext previewContext = new BlockPreviewContext(
               controllerContext,
               content,
               contentElement.ContentType.Alias,
               BlockType.BlockList,
               blockIndex);

            previewContext.ViewData = CreateViewData(blockInstance, previewContext);
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
            BlockValue blockData,
            IPublishedContent content,
            ControllerContext controllerContext)
        {
            if (blockData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData);

            BlockItemData? settingsData = blockData.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            RichTextBlockItem? blockInstance = CreateBlockInstance(
                BlockType.RichText,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as RichTextBlockItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            BlockPreviewContext previewContext = new BlockPreviewContext(
                controllerContext,
                content,
                contentElement.ContentType.Alias,
                BlockType.RichText);

            previewContext.ViewData = CreateViewData(blockInstance, previewContext);
            return await GetMarkup(previewContext);
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

        private IDataType? GetDataType(Guid dataTypeKey)
        {
            var cacheKey = string.Format(Constants.CacheKeys.DataType, dataTypeKey);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _dataTypeService.GetDataType(dataTypeKey);
            }, CacheDuration);
        }

        private IPublishedElement? ConvertToElement(BlockItemData data)
        {
            var newPropertyValues = new Dictionary<string, object?>();

            for (int i = 0; i < data.RawPropertyValues.Count; i++)
            {
                var property = data.RawPropertyValues.ElementAt(i);
                var propValue = property.Value;
                string? propertyAsString = propValue as string ?? JsonConvert.SerializeObject(propValue);

                if (propertyAsString.DetectIsJson() && (propertyAsString.Contains(Aliases.BlockGrid) || propertyAsString.Contains(Aliases.BlockList)))
                {
                    var propertyAsJson = JsonConvert.DeserializeObject<JObject>(propertyAsString);

                    if (propertyAsJson?.ContainsKey("layout") == true)
                    {
                        var layoutProperty = propertyAsJson.Value<JToken>("layout");
                        var layoutPropertyString = layoutProperty?.ToString();

                        if (layoutPropertyString?.Contains(Aliases.BlockGrid) == true)
                        {
                            var blockValue = _blockGridEditorValues.DeserializeAndClean(propValue);
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                newPropertyValues.Add(property.Key, JsonConvert.SerializeObject(blockValue.BlockValue));
                            }
                        }

                        else if (layoutPropertyString?.Contains(Aliases.BlockList) == true)
                        {
                            var blockValue = _blockListEditorValues.DeserializeAndClean(propValue);
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                newPropertyValues.Add(property.Key, JsonConvert.SerializeObject(blockValue.BlockValue));
                            }
                        }

                        else newPropertyValues.Add(property.Key, property.Value);
                    }
                }

                else newPropertyValues.Add(property.Key, property.Value);
            }

            data.RawPropertyValues = newPropertyValues;

            var element = _blockEditorConverter.ConvertToElement(data, PropertyCacheLevel.None, preview: true);
            if (element == null)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        private void FormatBlockData(List<BlockItemData>? blockData)
        {
            if (blockData == null)
                return;

            if (blockData.Any() == false)
                return;

            foreach (var contentData in blockData)
            {
                var newPropertyValues = new Dictionary<string, object?>();

                foreach (var propertyData in contentData.PropertyValues)
                {
                    if (propertyData.Value.PropertyType.PropertyEditorAlias == Aliases.ContentPicker)
                    {
                        if (Guid.TryParse(propertyData.Value.Value?.ToString(), out Guid parsedGuid))
                        {
                            string strUdi = StringUdi.Create("document", parsedGuid).UriValue.ToString();
                            newPropertyValues.Add(propertyData.Key, strUdi);
                        }

                        newPropertyValues.Add(propertyData.Key, propertyData.Value.Value);
                    }

                    else if (propertyData.Value.PropertyType.PropertyEditorAlias == Aliases.MultipleTextstring)
                    {
                        if (propertyData.Value.Value is JArray asArray)
                        {
                            IEnumerable<string?> array = asArray.OfType<JObject>()
                                .Where(x => x["value"] != null)
                                .Select(x => x["value"]!.Value<string>());

                            newPropertyValues.Add(propertyData.Key, string.Join("\r\n", array));
                        }
                    }

                    else if (propertyData.Value.Value is JObject jsonObject)
                    {
                        string strValue = JsonConvert.SerializeObject(jsonObject);
                        newPropertyValues.Add(propertyData.Key, strValue);
                    }

                    else if (propertyData.Value.Value is List<string> list)
                    {
                        string strValue = JsonConvert.SerializeObject(list);
                        newPropertyValues.Add(propertyData.Key, strValue);
                    }

                    else newPropertyValues.Add(propertyData.Key, propertyData.Value.Value);
                }

                contentData.RawPropertyValues = newPropertyValues;
            }
        }

        private BlockGridLayoutItem? GetMatchingGridLayout(List<string> layoutItems, BlockGridItem? blockInstance)
        {
            if (layoutItems == null || blockInstance == null)
                return null;

            foreach (var layoutItemJson in layoutItems)
            {
                var layoutItem = JsonConvert.DeserializeObject<BlockGridLayoutItem>(layoutItemJson);
                if (layoutItem == null) continue;

                if (layoutItem.ContentUdi == blockInstance.ContentUdi)
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
                            if (item.ContentUdi != blockInstance.ContentUdi) continue;
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
        /// <returns>A <see cref="ViewDataDictionary"/> containing the model and additional metadata for rendering the block
        /// preview.</returns>
        protected virtual ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockPreviewContext context)
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
            }

            return viewData;
        }

        private object? CreateBlockInstance(BlockType blockType, Type? contentBlockType, IPublishedElement? contentElement, Type? settingsBlockType, IPublishedElement? settingsElement, Udi? contentUdi, Udi? settingsUdi)
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

                return Activator.CreateInstance(blockItemType, contentUdi, contentInstance, settingsUdi, settingsInstance);
            }

            return null;
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

            var actionContext = new ActionContext(context.ControllerContext.HttpContext, new RouteData(), new ActionDescriptor());

            if (viewResult.View == null)
                return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));

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
            BlockEditorData blockValue,
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
                    BlockItemData? areaContentData = blockValue.BlockValue?.ContentData.FirstOrDefault(x => x.Udi == item.ContentUdi);
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData);

                    BlockItemData? areaSettingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault(x => x.Udi == item.SettingsUdi);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData) : default;

                    return new BlockGridItem(item.ContentUdi!, areaContentElement!, item.SettingsUdi!, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(new List<BlockGridItem>(area.Items.Count()), areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToList();
        }

        private async Task<string> GetMarkup(BlockPreviewContext context)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(context.ContentAlias?.ToPascalCase());

            return viewComponent != null
                ? await GetMarkupFromViewComponent(viewComponent, context)
                : await GetMarkupFromPartial(context);
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