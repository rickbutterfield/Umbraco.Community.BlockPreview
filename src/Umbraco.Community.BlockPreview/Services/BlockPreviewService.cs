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
            var blockValue = _blockGridEditorValues.DeserializeAndClean(blockData);
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

            IPublishedElement? contentElement = ConvertToElement(contentData, true, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsGuidParsed != Guid.Empty
                ? blockValue?.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == settingsGuidParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true, content) : default;

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

            ConfigureBlockInstanceAreas(blockInstance, config, matchingBlockConfig, matchingLayout!);

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockGrid, matchingBlockConfig, blockIndex);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockGrid);
        }

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

            IPublishedElement? contentElement = ConvertToElement(contentData, true, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = settingsGuidParsed != Guid.Empty
                ? blockValue?.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == settingsGuidParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true, content) : default;

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

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockList, null, blockIndex);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockList);
        }

        public async Task<string> RenderRichTextBlock(
            string blockData,
            IPublishedContent content,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default)
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

            IPublishedElement? contentElement = ConvertToElement(contentData, true, content);

            FormatBlockData(blockValue?.BlockValue.SettingsData);
            BlockItemData? settingsData = blockValue?.BlockValue.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true, content) : default;

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

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.RichText);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.RichText);
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

        private IPublishedElement? ConvertToElement(BlockItemData data, bool throwOnError, IPublishedElement owner)
        {
            for (int i = 0; i < data.Values.Count(); i++)
            {
                var property = data.Values.ElementAt(i);
                var value = property.Value;
                string? propertyAsString = value?.ToString();

                if (propertyAsString?.Contains(nameof(BlockGridLayoutItem)) == true)
                {
                    var blockValue = _blockGridEditorValues.DeserializeAndClean(propertyAsString);
                    if (blockValue != null)
                    {
                        FormatBlockData(blockValue.BlockValue.ContentData);
                        FormatBlockData(blockValue.BlockValue.SettingsData);
                        property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                    }
                }

                if (propertyAsString?.Contains(nameof(BlockListLayoutItem)) == true)
                {
                    var blockValue = _blockListEditorValues.DeserializeAndClean(propertyAsString);
                    if (blockValue != null)
                    {
                        FormatBlockData(blockValue.BlockValue.ContentData);
                        FormatBlockData(blockValue.BlockValue.SettingsData);
                        property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                    }
                }

                if (propertyAsString?.Contains(nameof(RichTextBlockLayoutItem)) == true)
                {
                    RichTextPropertyEditorHelper.TryParseRichTextEditorValue(value, _jsonSerializer, _logger, out RichTextEditorValue? richTextEditorValue);

                    if (richTextEditorValue != null)
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
            }

            var element = _blockEditorConverter.ConvertToElement(owner, data, PropertyCacheLevel.None, throwOnError);
            if (element == null && throwOnError)
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
                foreach (var propertyData in contentData.Values)
                {
                    if (propertyData.EditorAlias == PropertyEditors.Aliases.ContentPicker)
                    {
                        if (Guid.TryParse(propertyData.Value?.ToString(), out Guid parsedGuid))
                        {
                            propertyData.Value = StringUdi.Create("document", parsedGuid).UriValue.ToString();
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
                        if (!string.IsNullOrEmpty(str) && str.DetectIsJson())
                        {
                            propertyData.Value = JsonSerializer.Serialize(str, _jsonSerializerOptions);
                        }
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

        private ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockType? blockType = default, BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlockConfig = null, int? blockIndex = 0)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            if (blockType == BlockType.BlockGrid && matchingBlockConfig != null && matchingBlockConfig.Areas.Any())
            {
                viewData["matchingBlockConfig"] = matchingBlockConfig;
            }

            viewData["blockPreview"] = true;
            viewData["blockIndex"] = blockIndex;

            if (blockType == BlockType.BlockGrid)
                viewData["blockGridPreview"] = true;

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

        private async Task<string> GetMarkup(ControllerContext controllerContext, string? contentAlias, ViewDataDictionary viewData, BlockType blockType)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(contentAlias?.ToPascalCase());

            return viewComponent != null
                ? await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent)
                : await GetMarkupFromPartial(controllerContext, viewData, contentAlias, blockType);
        }

        private async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            string? contentAlias,
            BlockType blockType)
        {
            var viewResult = GetViewResult(contentAlias, blockType);

            if (viewResult == null)
            {
                viewResult =
                    _razorViewEngine.FindView(controllerContext, contentAlias!, false) ??
                    _razorViewEngine.FindView(controllerContext, contentAlias?.ToPascalCase()!, false);

                if (!viewResult.Success)
                    return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));
            }

            if (viewResult.View == null)
                return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));

            var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());

            await using var sw = new StringWriter();

            if (viewData != null)
            {
                var viewContext = new ViewContext(actionContext, viewResult.View, viewData,
                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);
            }

            return sw.ToString();
        }

        private async Task<string> GetMarkupFromViewComponent(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            ViewComponentDescriptor viewComponent)
        {
            await using var sw = new StringWriter();
            var viewContext = new ViewContext(
                controllerContext,
                new FakeView(),
                viewData,
                new TempDataDictionary(controllerContext.HttpContext, _tempDataProvider),
                sw,
                new HtmlHelperOptions());

            _viewComponentHelperWrapper.Contextualize(viewContext);

            var result = await _viewComponentHelperWrapper.InvokeAsync(viewComponent.TypeInfo.AsType(), viewData.Model);
            result.WriteTo(sw, HtmlEncoder.Default);
            return sw.ToString();
        }

        private void ConfigureBlockInstanceAreas(
            BlockGridItem blockInstance,
            BlockGridConfiguration config,
            BlockGridConfiguration.BlockGridBlockConfiguration matchingBlock,
            BlockGridLayoutItem layoutItem)
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

                //var items = area.Items.Select(item =>
                //{
                //    BlockItemData? areaContentData = blockValue.BlockValue?.ContentData.FirstOrDefault(x => x.Key == item.ContentKey);
                //    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, true, content);

                //    BlockItemData? areaSettingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault(x => x.Key == item.ContentKey);
                //    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, true, content) : default;

                //    return new BlockGridItem(item.ContentKey, areaContentElement!, item.SettingsKey, areaSettingsElement!);
                //}).WhereNotNull().ToList();

                return new BlockGridArea(new List<BlockGridItem>(area.Items.Count()), areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToArray();
        }

        private ViewEngineResult? GetViewResult(string? contentAlias, BlockType blockType)
        {
            if (string.IsNullOrEmpty(contentAlias))
                return null;

            var viewPaths = _options.GetViewLocations(blockType);

            if (viewPaths == null || !viewPaths.Any())
                return null;

            ViewEngineResult? viewResult = null;
            string appRoot = _webHostEnvironment.ContentRootPath;

            foreach (var viewPath in viewPaths)
            {
                string baseViewPath = viewPath.TrimStart($"~{Path.DirectorySeparatorChar}").TrimStart("/");

                var pathNonPascal = string.Format(baseViewPath, contentAlias ?? "");
                var viewPathNonPascal = Path.Combine(appRoot, pathNonPascal);

                if (System.IO.File.Exists(viewPathNonPascal))
                {
                    viewResult = _razorViewEngine.GetView("", pathNonPascal, false);

                    if (viewResult.Success)
                        return viewResult;
                }

                else
                {
                    var pathPascal = string.Format(baseViewPath, contentAlias?.ToPascalCase() ?? "");
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