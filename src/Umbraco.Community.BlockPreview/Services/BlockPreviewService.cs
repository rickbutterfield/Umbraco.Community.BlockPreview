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
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
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
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;
using static Umbraco.Cms.Core.Constants.PropertyEditors;

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
        private readonly IDataTypeService _dataTypeService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IJsonSerializer _jsonSerializer;

        private const string BLOCK_TYPE_CACHE_KEY = "BlockPreview_BlockType_{0}";
        private const string CONTENT_TYPE_CACHE_KEY = "BlockPreview_ContentType_{0}";
        private const string DATA_TYPE_CACHE_KEY = "BlockPreview_DataType_{0}";
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
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            AppCaches appCaches,
            IWebHostEnvironment webHostEnvironment,
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
        }

        #region Public
        public async Task<string> RenderGridBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            if (blockData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockData.ContentData.Any())
            {
                BlockGridEditorDataConverter converter = new BlockGridEditorDataConverter(_jsonSerializer);
                converter.TryDeserialize(JsonConvert.SerializeObject(blockData), out var convertedBlockData);
            }

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockData.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

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
                return string.Empty;

            List<string>? layoutItems = blockData?.Layout?.FirstOrDefault().Value.Select(layout => layout.ToString()).ToList();
            BlockGridLayoutItem? layoutItem = GetMatchingGridLayout(layoutItems!, blockInstance);

            IContentType? documentType = GetContentType(documentTypeUnique);
            if (documentType == null)
                return string.Empty;

            IPropertyType? property = documentType.PropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));
            if (property == null)
            {
                property = documentType.CompositionPropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));

                if (property == null)
                    return string.Empty;
            }

            IDataType? dataType = GetDataType(property.DataTypeKey);
            if (dataType == null)
                return string.Empty;

            BlockGridConfiguration? config = dataType.ConfigurationAs<BlockGridConfiguration>();
            if (config == null)
                return string.Empty;

            BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlock = config.Blocks.FirstOrDefault(x => x.ContentElementTypeKey == contentData.ContentTypeKey);
            if (matchingBlock == null)
                return string.Empty;

            ConfigureBlockInstanceAreas(blockInstance, config, matchingBlock, layoutItem!, blockData!);

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockGrid);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockGrid);
        }

        public async Task<string> RenderListBlock(
            BlockValue blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            if (blockData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            if (!blockData.ContentData.Any())
            {
                BlockListEditorDataConverter converter = new BlockListEditorDataConverter();
                converter.TryDeserialize(JsonConvert.SerializeObject(blockData), out var convertedBlockData);
            }

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentKey);

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockData.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.NoGeneratedModels);

            BlockListItem? blockInstance = CreateBlockInstance(
                BlockType.BlockList,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockInstance);

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockList);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockList);
        }

#if NET8_0
        public async Task<string> RenderRichTextBlock(
            BlockValue blockData,
            ControllerContext controllerContext)
        {
            if (blockData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidBlockData);

            BlockItemData? contentData = blockData.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Format(Constants.ErrorMessages.ErrorTemplate, Constants.ErrorMessages.InvalidContentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = blockData.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

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

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.RichText);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.RichText);
        }
#endif
        #endregion

        #region Private
        private Type? FindBlockType(string? contentTypeAlias)
        {
            if (string.IsNullOrEmpty(contentTypeAlias))
                return null;

            var cacheKey = string.Format(BLOCK_TYPE_CACHE_KEY, contentTypeAlias);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _typeFinder
                    .FindClassesWithAttribute<PublishedModelAttribute>()
                    .FirstOrDefault(x => x.GetCustomAttribute<PublishedModelAttribute>(false)?.ContentTypeAlias == contentTypeAlias);
            }, CacheDuration);
        }

        private IContentType? GetContentType(Guid documentTypeUnique)
        {
            var cacheKey = string.Format(CONTENT_TYPE_CACHE_KEY, documentTypeUnique);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _contentTypeService.Get(documentTypeUnique);
            }, CacheDuration);
        }

        private IDataType? GetDataType(Guid dataTypeKey)
        {
            var cacheKey = string.Format(DATA_TYPE_CACHE_KEY, dataTypeKey);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _dataTypeService.GetDataType(dataTypeKey);
            }, CacheDuration);
        }

        private IPublishedElement? ConvertToElement(BlockItemData data, bool throwOnError)
        {
            Parallel.ForEach(data.RawPropertyValues, prop =>
            {
                string? propertyAsString = prop.Value as string ?? JsonConvert.SerializeObject(prop.Value);

                if (propertyAsString?.Contains(Aliases.BlockList) == true || propertyAsString?.Contains(Aliases.BlockGrid) == true)
                {
                    if (prop.Value.TryConvertToBlockItem(out BlockValue? blockValue))
                    {
                        blockValue?.ContentData.ForEach(ConvertNestedValuesToString);
                        blockValue?.SettingsData.ForEach(ConvertNestedValuesToString);
                        data.RawPropertyValues[prop.Key] = JsonConvert.SerializeObject(blockValue);
                    }
                    else data.RawPropertyValues[prop.Key] = propertyAsString;
                }
            });

            var element = _blockEditorConverter.ConvertToElement(data, PropertyCacheLevel.None, throwOnError);
            if (element == null && throwOnError)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        private void ConvertNestedValuesToString(BlockItemData? blockData)
        {
            if (blockData == null)
                return;

            foreach (var rawPropValue in blockData.RawPropertyValues.Where(x => x.Value != null))
            {
                var originalValue = rawPropValue.Value;
                if (originalValue.TryConvertToBlockItem(out BlockValue? blockValue))
                {
                    blockValue?.ContentData.ForEach(ConvertNestedValuesToString);
                    blockValue?.SettingsData.ForEach(ConvertNestedValuesToString);
                    blockData.RawPropertyValues[rawPropValue.Key] = JsonConvert.SerializeObject(blockValue);
                    continue;
                }
                blockData.RawPropertyValues[rawPropValue.Key] = originalValue?.ToString();
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
        
        private ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockType? blockType = default, BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlockConfig = null)
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

            if (blockType == BlockType.BlockGrid)
                viewData["blockGridPreview"] = true;

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
#if NET8_0
                else if (blockType == BlockType.RichText)
                {
                    blockItemType = settingsBlockType != null ?
                        typeof(RichTextBlockItem<,>).MakeGenericType(contentBlockType, settingsBlockType) :
                        typeof(RichTextBlockItem<>).MakeGenericType(contentBlockType);

                }
#endif
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

        private async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary? viewData,
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

            var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());

            if (viewResult.View == null)
                return string.Format(Constants.ErrorMessages.WarningTemplate, string.Format(Constants.ErrorMessages.ViewNotFound, viewResult.ViewName, string.Join("<br/>", viewResult.SearchedLocations)));

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
            BlockGridLayoutItem layoutItem,
            BlockValue blockValue)
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
                    BlockItemData? areaContentData = blockValue.ContentData.FirstOrDefault(x => x.Udi == item.ContentUdi);
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, true);

                    BlockItemData? areaSettingsData = blockValue.SettingsData.FirstOrDefault(x => x.Udi == item.SettingsUdi);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, true) : default;

                    return new BlockGridItem(item.ContentUdi!, areaContentElement!, item.SettingsUdi!, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(new List<BlockGridItem>(area.Items.Count()), areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToList();
        }

        private async Task<string> GetMarkup(ControllerContext controllerContext, string? contentAlias, ViewDataDictionary viewData, BlockType blockType)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            return viewComponent != null
                ? await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent)
                : await GetMarkupFromPartial(controllerContext, viewData, contentAlias, blockType);
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