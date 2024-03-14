using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Umbraco.Cms.Core.PropertyEditors;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Microsoft.Extensions.Options;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeListPreviewService : BackOfficePreviewService, IBackOfficeListPreviewService
    {
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly ITypeFinder _typeFinder;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly IViewComponentSelector _viewComponentSelector;
        private readonly ContextCultureService _contextCultureService;

        public BackOfficeListPreviewService(
            BlockEditorConverter blockEditorConverter,
            ContextCultureService contextCultureService,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IOptions<BlockPreviewOptions> options,
            IRazorViewEngine razorViewEngine) : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine, options)
        {
            _blockEditorConverter = blockEditorConverter;
            _typeFinder = typeFinder;
            _publishedValueFallback = publishedValueFallback;
            _viewComponentSelector = viewComponentSelector;
            _contextCultureService = contextCultureService;
        }

        public async Task<string> GetMarkupForBlock(
            IPublishedContent page,
            BlockValue blockValue,
            string blockEditorAlias,
            ControllerContext controllerContext,
            string culture)
        {
            _contextCultureService.SetCulture(culture);

            BlockItemData? contentData = blockValue.ContentData.FirstOrDefault();
            BlockItemData? settingsData = blockValue.SettingsData.FirstOrDefault();

            // Convert each nested value to a string to enable proper conversion
            if (contentData != null)
            {
                foreach (var rawPropValue in contentData.RawPropertyValues)
                {
                    contentData.RawPropertyValues[rawPropValue.Key] = rawPropValue.Value.ToString();
                }
            }

            // convert the JSON data to a IPublishedElement (using the built-in conversion)
            IPublishedElement? contentElement = _blockEditorConverter.ConvertToElement(contentData, PropertyCacheLevel.None, true);

            if (contentElement == null)
            {
                throw new InvalidOperationException($"Unable to find Element {contentData.ContentTypeAlias}");
            }

            IPublishedElement? settingsElement = settingsData != null ? _blockEditorConverter.ConvertToElement(settingsData, PropertyCacheLevel.None, true) : default;

            Type? contentBlockType = _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false).ContentTypeAlias == contentElement.ContentType.Alias);

            Type? settingsBlockType = settingsElement != null ? _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false).ContentTypeAlias == settingsElement.ContentType.Alias) : default;

            object? blockInstance = null;

            if (contentBlockType != null)
            {
                var contentInstance = Activator.CreateInstance(contentBlockType, contentElement, _publishedValueFallback);

                var settingsInstance = settingsBlockType != default ? Activator.CreateInstance(settingsBlockType, settingsElement, _publishedValueFallback) : default;

                Type blockItemType = null;
                if (settingsBlockType != default)
                {
                    blockItemType = typeof(BlockListItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                }
                else
                {
                    blockItemType = typeof(BlockListItem<>).MakeGenericType(contentBlockType);
                }

                blockInstance = Activator.CreateInstance(blockItemType, contentData.Udi, contentInstance, settingsData?.Udi, settingsInstance);
            }
            else
            {
                if (settingsElement != null)
                {
                    blockInstance = new BlockListItem(contentData.Udi, contentElement, settingsData.Udi, settingsElement);
                }
                else
                {
                    blockInstance = new BlockListItem(contentData.Udi, contentElement, null, null);
                }
            }

            ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = blockInstance
            };

            viewData["blockPreview"] = true;

            string contentAlias = contentElement.ContentType.Alias;
            ViewComponentDescriptor viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            if (viewComponent != null)
            {
                return await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent);
            }

            return await GetMarkupFromPartial(controllerContext, viewData, contentAlias, false);
        }
    }
}