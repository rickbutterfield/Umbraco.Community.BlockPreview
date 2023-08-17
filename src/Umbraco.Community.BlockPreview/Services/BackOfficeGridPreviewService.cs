using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Rendering;
using Umbraco.Cms.Core.PropertyEditors;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficeGridPreviewService : BackOfficePreviewService, IBackOfficeGridPreviewService
    {
        private readonly BlockEditorConverter _blockEditorConverter;

        private readonly ITypeFinder _typeFinder;

        private readonly IPublishedValueFallback _publishedValueFallback;

        private readonly IViewComponentSelector _viewComponentSelector;

        public BackOfficeGridPreviewService(
            BlockEditorConverter blockEditorConverter,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IRazorViewEngine razorViewEngine) : base(tempDataProvider, viewComponentHelperWrapper, razorViewEngine)
        {
            _blockEditorConverter = blockEditorConverter;
            _typeFinder = typeFinder;
            _publishedValueFallback = publishedValueFallback;
            _viewComponentSelector = viewComponentSelector;
        }

        public async Task<string> GetMarkupForBlock(
            BlockValue blockValue,
            ControllerContext controllerContext,
            string culture)
        {
            SetCulture(culture);

            var contentData = blockValue.ContentData.FirstOrDefault();
            var settingsData = blockValue.SettingsData.FirstOrDefault();

            var references = new List<ContentAndSettingsReference>() { new ContentAndSettingsReference(contentData?.Udi, settingsData?.Udi) };
            BlockEditorData blockEditorData = new BlockEditorData(Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid, references, blockValue);

            // convert the JSON data to a IPublishedElement (using the built-in conversion)
            IPublishedElement contentElement = _blockEditorConverter.ConvertToElement(contentData, PropertyCacheLevel.None, true);

            if (contentElement == null)
            {
                throw new InvalidOperationException($"Unable to find Element {contentData.ContentTypeAlias}");
            }

            IPublishedElement settingsElement = settingsData != null ? _blockEditorConverter.ConvertToElement(settingsData, PropertyCacheLevel.None, true) : default;

            Type contentBlockType = _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false).ContentTypeAlias == contentElement.ContentType.Alias);

            Type settingsBlockType = settingsElement != null ? _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().FirstOrDefault(x =>
                x.GetCustomAttribute<PublishedModelAttribute>(false).ContentTypeAlias == settingsElement.ContentType.Alias) : default;

            object blockInstance = null;

            if (contentBlockType != null)
            {
                var contentInstance = Activator.CreateInstance(contentBlockType, contentElement, _publishedValueFallback);

                var settingsInstance = settingsBlockType != default ? Activator.CreateInstance(settingsBlockType, settingsElement, _publishedValueFallback) : default;

                Type blockItemType = null;
                if (settingsBlockType != default)
                {
                    blockItemType = typeof(BlockGridItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                }
                else
                {
                    blockItemType = typeof(BlockGridItem<>).MakeGenericType(contentBlockType);
                }

                blockInstance = Activator.CreateInstance(blockItemType, contentData.Udi, contentInstance, settingsData?.Udi, settingsInstance);
            }
            else
            {
                if (settingsElement != null)
                {
                    blockInstance = new BlockGridItem(contentData.Udi, contentElement, settingsData.Udi, settingsElement);
                }
                else
                {
                    blockInstance = new BlockGridItem(contentData.Udi, contentElement, null, null);
                }
            }

            ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary());
            viewData.Model = blockInstance;
            viewData["blockPreview"] = true;

            string contentAlias = contentElement.ContentType.Alias;
            ViewComponentDescriptor viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            var cultureInfo = new CultureInfo(culture);
            Thread.CurrentThread.CurrentCulture = cultureInfo;
            Thread.CurrentThread.CurrentUICulture = cultureInfo;

            if (viewComponent != null)
            {
                return await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent);
            }

            return await GetMarkupFromPartial(controllerContext, viewData, contentAlias, true);
        }
    }
}
