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
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache.PropertyEditors;
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
using Umbraco.Community.BlockPreview.Models;
using Umbraco.Extensions;

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
        private readonly IWebHostEnvironment _webHostEnvironment;

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
            IWebHostEnvironment webHostEnvironment)
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
        }

        #region Public
        public async Task<string> RenderGridBlock(
            string blockData,
            ControllerContext controllerContext,
            string blockEditorAlias = "",
            Guid documentTypeUnique = default,
            string contentUdi = "",
            string? settingsUdi = default)
        {
            BlockGridEditorDataConverter converter = new BlockGridEditorDataConverter(_jsonSerializer);
            if (!converter.TryDeserialize(blockData, out BlockEditorData<BlockGridValue, BlockGridLayoutItem>? blockValue))
                return string.Empty;

            if (!UdiParser.TryParse(contentUdi, out Udi? contentUdiParsed))
                return string.Empty;

            UdiParser.TryParse(settingsUdi!, out Udi? settingsUdiParsed);

            BlockItemData? contentData = blockValue.BlockValue?.ContentData.FirstOrDefault(x => x.Udi == contentUdiParsed);
            if (contentData == null)
                return string.Empty;

            ConvertNestedValuesToString(contentData);

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = settingsUdiParsed != null
                ? blockValue.BlockValue?.SettingsData.FirstOrDefault(x => x.Udi == settingsUdiParsed)
                : null;

            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            if (contentBlockType == null || (settingsElement != null && settingsBlockType == null))
            {
                return $"<div class=\"preview-alert preview-alert-warning\">ModelsBuilder is enabled but the generated model(s) could not be found. Please try regenerating models and restarting the application.</div>";
            }

            BlockGridItem? blockInstance = CreateBlockInstance(
                BlockType.BlockGrid,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as BlockGridItem;

            if (blockInstance == null)
                return string.Empty;

            var layoutItems = blockValue.BlockValue?.GetLayouts();
            BlockGridLayoutItem? matchingLayout = GetMatchingLayout(layoutItems!, blockInstance);

            IContentType? documentType = _contentTypeService.Get(documentTypeUnique);
            if (documentType == null)
                return string.Empty;

            IPropertyType? property = documentType.PropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));
            if (property == null)
            {
                property = documentType.CompositionPropertyTypes.FirstOrDefault(x => x.Alias.Equals(blockEditorAlias));

                if (property == null)
                    return string.Empty;
            }

            IDataType? dataType = await _dataTypeService.GetAsync(property.DataTypeKey);
            if (dataType == null)
                return string.Empty;

            BlockGridConfiguration? config = dataType.ConfigurationAs<BlockGridConfiguration>();
            if (config == null)
                return string.Empty;

            BlockGridConfiguration.BlockGridBlockConfiguration? matchingBlock = config.Blocks.FirstOrDefault(x => x.ContentElementTypeKey == contentData.ContentTypeKey);
            if (matchingBlock == null)
                return string.Empty;

            ConfigureBlockInstanceAreas(blockInstance, config, matchingBlock, matchingLayout!, blockValue);

            ViewDataDictionary viewData = CreateViewData(blockInstance, BlockType.BlockGrid);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockGrid);
        }

        public async Task<string> RenderListBlock(
            string blockData,
            ControllerContext controllerContext)
        {
            var converter = new BlockListEditorDataConverter(_jsonSerializer);
            if (!converter.TryDeserialize(blockData, out BlockEditorData<BlockListValue, BlockListLayoutItem>? blockValue))
                return string.Empty;

            BlockItemData? contentData = blockValue.BlockValue?.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Empty;

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            BlockListItem? blockInstance = CreateBlockInstance(
                BlockType.BlockList,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement,
                contentData.Udi, settingsData?.Udi
            ) as BlockListItem;

            if (blockInstance == null)
                return string.Empty;

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.BlockList);
        }

        public async Task<string> RenderRichTextBlock(
            string blockData,
            ControllerContext controllerContext)
        {
            var converter = new RichTextEditorBlockDataConverter(_jsonSerializer);
            if (!converter.TryDeserialize(blockData, out BlockEditorData<RichTextBlockValue, RichTextBlockLayoutItem>? blockValue))
                return string.Empty;

            BlockItemData? contentData = blockValue.BlockValue?.ContentData.FirstOrDefault();
            if (contentData == null)
                return string.Empty;

            IPublishedElement? contentElement = ConvertToElement(contentData, true);

            BlockItemData? settingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault();
            IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;

            Type? contentBlockType = FindBlockType(contentElement?.ContentType.Alias);
            Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsElement.ContentType.Alias) : default;

            RichTextBlockItem? blockInstance = CreateBlockInstance(
                BlockType.RichText,
                contentBlockType, contentElement,
                settingsBlockType, settingsElement, contentData.Udi,
                settingsData?.Udi
            ) as RichTextBlockItem;

            if (blockInstance == null)
                return string.Empty;

            ViewDataDictionary viewData = CreateViewData(blockInstance);
            return await GetMarkup(controllerContext, contentElement?.ContentType.Alias, viewData, BlockType.RichText);
        }
        #endregion

        #region Private
        private void ConvertNestedValuesToString(BlockItemData? blockData)
        {
            if (blockData == null)
                return;

            foreach (var rawPropValue in blockData.RawPropertyValues.Where(x => x.Value != null))
            {
                var originalValue = rawPropValue.Value;
                if (originalValue.TryConvertToGridItem(out BlockValue<BlockGridLayoutItem>? blockValue))
                {
                    blockValue?.ContentData.ForEach(ConvertNestedValuesToString);
                    blockValue?.SettingsData.ForEach(ConvertNestedValuesToString);
                    blockData.RawPropertyValues[rawPropValue.Key] = JsonSerializer.Serialize(blockValue);
                    continue;
                }
                blockData.RawPropertyValues[rawPropValue.Key] = originalValue?.ToString();
            }
        }

        private IPublishedElement? ConvertToElement(BlockItemData data, bool throwOnError)
        {
            var properties = data.RawPropertyValues;

            var jsonProperties = properties
                .Where(x => x.Value is string str && !string.IsNullOrEmpty(str) && str.DetectIsJson())
                .ToDictionary(x => x.Key, x => x.Value?.ToString());

            foreach (var property in jsonProperties)
            {
                var key = property.Key;
                var propertyAsString = property.Value!;

                if (propertyAsString.Contains("unique") && propertyAsString.Contains("type"))
                {
                    try
                    {
                        using (var document = JsonDocument.Parse(propertyAsString))
                        {
                            // Ensure that the JSON is an array
                            if (document.RootElement.ValueKind == JsonValueKind.Array)
                            {
                                bool isValidArray = true;

                                // Check each object in the array
                                foreach (var el in document.RootElement.EnumerateArray())
                                {
                                    // Validate that each element is an object with only "unique" and "type" properties
                                    if (el.ValueKind != JsonValueKind.Object ||
                                        el.EnumerateObject().Count() != 2 ||
                                        !el.TryGetProperty("unique", out _) ||
                                        !el.TryGetProperty("type", out _))
                                    {
                                        isValidArray = false;
                                        break;
                                    }
                                }

                                // If all elements in the array match the criteria, proceed with deserialization
                                if (isValidArray)
                                {
                                    var entityReference = JsonSerializer.Deserialize<List<EditorEntityReference>>(propertyAsString);
                                    if (entityReference != null)
                                    {
                                        properties[key] = string.Join(",", entityReference.Select(x => new StringUdi(x.Type, x.Unique.ToString())));
                                    }
                                }
                            }
                        }
                    }
                    catch (JsonException)
                    {
                        if (throwOnError)
                            throw new InvalidOperationException($"Invalid JSON format for property '{key}'.");
                    }
                }
            }

            var element = _blockEditorConverter.ConvertToElement(data, PropertyCacheLevel.None, throwOnError);
            if (element == null && throwOnError)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        private BlockGridLayoutItem? GetMatchingLayout(IEnumerable<BlockGridLayoutItem> layoutItems, BlockGridItem? blockInstance)
        {
            BlockGridLayoutItem? matchingLayout = null;

            if (layoutItems != null && blockInstance != null)
            {
                foreach (var layoutItem in layoutItems)
                {
                    if (layoutItem.ContentUdi == blockInstance.ContentUdi)
                    {
                        blockInstance.RowSpan = layoutItem.RowSpan!.Value;
                        blockInstance.ColumnSpan = layoutItem.ColumnSpan!.Value;
                        matchingLayout = layoutItem;
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
                                matchingLayout = layoutItem;
                                break;
                            }
                        }
                    }
                }
            }

            return matchingLayout;
        }

        private Type? FindBlockType(string? contentTypeAlias)
        {
            if (string.IsNullOrEmpty(contentTypeAlias))
                return null;

            var type = _typeFinder
                .FindClassesWithAttribute<PublishedModelAttribute>()
                .FirstOrDefault(x => x.GetCustomAttribute<PublishedModelAttribute>(false)?.ContentTypeAlias == contentTypeAlias);

            return type;
        }

        private ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockType? blockType = default)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

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

        private async Task<string> GetMarkup(ControllerContext controllerContext, string? contentAlias, ViewDataDictionary viewData, BlockType blockType)
        {
            var viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

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
                    return string.Empty;
            }

            if (viewResult.View == null)
                return string.Empty;

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
            BlockGridLayoutItem layoutItem,
            BlockEditorData<BlockGridValue, BlockGridLayoutItem> blockValue)
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
                    IPublishedElement? areaContentElement = ConvertToElement(areaContentData!, true);

                    BlockItemData? areaSettingsData = blockValue.BlockValue?.SettingsData.FirstOrDefault(x => x.Udi == item.SettingsUdi);
                    IPublishedElement? areaSettingsElement = areaSettingsData != null ? ConvertToElement(areaSettingsData, true) : default;

                    return new BlockGridItem(item.ContentUdi!, areaContentElement!, item.SettingsUdi!, areaSettingsElement!);
                }).WhereNotNull().ToList();

                return new BlockGridArea(items, areaConfig.Alias!, areaConfig.RowSpan!.Value, areaConfig.ColumnSpan!.Value);
            }).WhereNotNull().ToList();
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