using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeGridPreviewService : BackOfficePreviewServiceBase, IBackOfficeGridPreviewService
    {
        private readonly ContextCultureService _contextCultureService;

        public BackOfficeGridPreviewService(
            BlockEditorConverter blockEditorConverter,
            ContextCultureService contextCultureService,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IOptions<BlockPreviewOptions> options,
            IRazorViewEngine razorViewEngine) : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine, typeFinder, blockEditorConverter, viewComponentSelector, publishedValueFallback, options)
        {
            _contextCultureService = contextCultureService;
        }

        public override async Task<string> GetMarkupForBlock(
            IPublishedContent page,
            BlockValue blockValue,
            string blockEditorAlias,
            ControllerContext controllerContext,
            string? culture)
        {
            if (!string.IsNullOrEmpty(culture))
            {
                _contextCultureService.SetCulture(culture);
            }

            BlockItemData? contentData = blockValue.ContentData.FirstOrDefault();
            BlockItemData? settingsData = blockValue.SettingsData.FirstOrDefault();

            if (contentData != null)
            {
                ConvertNestedValuesToString(contentData);

                IPublishedElement? contentElement = ConvertToElement(contentData, true);
                string? contentTypeAlias = contentElement?.ContentType.Alias;

                IPublishedElement? settingsElement = settingsData != null ? ConvertToElement(settingsData, true) : default;
                string? settingsTypeAlias = settingsElement?.ContentType.Alias;

                Type? contentBlockType = FindBlockType(contentTypeAlias);
                Type? settingsBlockType = settingsElement != null ? FindBlockType(settingsTypeAlias) : default;

                object? blockInstance = CreateBlockInstance(true, contentBlockType, contentElement, settingsBlockType, settingsElement, contentData.Udi, settingsData?.Udi);

                BlockGridItem? typedBlockInstance = blockInstance as BlockGridItem;

                var contentProperty = page.Properties.FirstOrDefault(x => x.PropertyType.EditorAlias.Equals(blockEditorAlias));

                BlockGridModel? typedBlockGridModel = contentProperty?.GetValue() as BlockGridModel;

                UpdateBlockGridItem(typedBlockGridModel, contentData, typedBlockInstance);

                ViewDataDictionary? viewData = CreateViewData(typedBlockInstance);

                return await GetMarkup(controllerContext, contentTypeAlias, viewData, true);
            }

            return string.Empty;
        }

        private static void UpdateBlockGridItem(BlockGridModel? typedBlockGridModel, BlockItemData? contentData, BlockGridItem? typedBlockInstance)
        {
            if (typedBlockGridModel != null)
            {
                var blockGridItem = typedBlockGridModel?.FirstOrDefault(x => x.ContentUdi == contentData?.Udi);

                if (blockGridItem == null && typedBlockGridModel != null)
                {
                    foreach (BlockGridItem item in typedBlockGridModel)
                    {
                        foreach (BlockGridArea area in item.Areas)
                        {
                            foreach (BlockGridItem childItem in area)
                            {
                                if (childItem.ContentUdi == contentData?.Udi)
                                {
                                    blockGridItem = childItem;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (blockGridItem != null && typedBlockInstance != null)
                {
                    typedBlockInstance.RowSpan = blockGridItem.RowSpan;
                    typedBlockInstance.ColumnSpan = blockGridItem.ColumnSpan;
                    typedBlockInstance.AreaGridColumns = blockGridItem.AreaGridColumns;
                    typedBlockInstance.GridColumns = blockGridItem.GridColumns;
                    typedBlockInstance.Areas = blockGridItem.Areas;
                }
            }
        }

        public override ViewDataDictionary CreateViewData(object? typedBlockInstance)
        {
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = typedBlockInstance
            };

            viewData["blockPreview"] = true;
            viewData["blockGridPreview"] = true;
            return viewData;
        }
    }
}