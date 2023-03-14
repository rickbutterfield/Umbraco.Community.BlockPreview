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

namespace Umbraco.Community.BlockPreview.Services
{
    public sealed class BackOfficePreviewService : IBackOfficePreviewService
    {
        private readonly BlockEditorConverter _blockEditorConverter;

        private readonly ITempDataProvider _tempDataProvider;

        private readonly ITypeFinder _typeFinder;

        private readonly IPublishedValueFallback _publishedValueFallback;

        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;

        private readonly IViewComponentSelector _viewComponentSelector;

        private readonly IRazorViewEngine _razorViewEngine;

        public BackOfficePreviewService(
            BlockEditorConverter blockEditorConverter,
            ITempDataProvider tempDataProvider,
            ITypeFinder typeFinder,
            IPublishedValueFallback publishedValueFallback,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IViewComponentSelector viewComponentSelector,
            IRazorViewEngine razorViewEngine)
        {
            _blockEditorConverter = blockEditorConverter;
            _tempDataProvider = tempDataProvider;
            _typeFinder = typeFinder;
            _publishedValueFallback = publishedValueFallback;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _viewComponentSelector = viewComponentSelector;
            _razorViewEngine = razorViewEngine;
        }

        public async Task<string> GetMarkupForBlock(
            BlockItemData contentData,
            BlockItemData settingsData,
            bool isGrid,
            ControllerContext controllerContext)
        {
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
                    blockItemType = isGrid ? typeof(BlockGridItem<,>).MakeGenericType(contentBlockType, settingsBlockType) : typeof(BlockListItem<,>).MakeGenericType(contentBlockType, settingsBlockType);
                }
                else
                {
                    blockItemType = isGrid ? typeof(BlockGridItem<>).MakeGenericType(contentBlockType) : typeof(BlockListItem<>).MakeGenericType(contentBlockType);
                }

                blockInstance = Activator.CreateInstance(blockItemType, contentData.Udi, contentInstance, settingsData?.Udi, settingsInstance);
            }
            else
            {
                if (settingsElement != null)
                {
                    blockInstance = isGrid ? new BlockGridItem(contentData.Udi, contentElement, settingsData.Udi, settingsElement) : new BlockListItem(contentData.Udi, contentElement, settingsData.Udi, settingsElement);
                }
                else
                {
                    blockInstance = isGrid ? new BlockGridItem(contentData.Udi, contentElement, null, null) : new BlockListItem(contentData.Udi, contentElement, null, null);
                }
            }

            ViewDataDictionary viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary());
            viewData.Model = blockInstance;
            viewData["blockPreview"] = true;

            string contentAlias = contentElement.ContentType.Alias.ToFirstUpper();
            ViewComponentDescriptor viewComponent = _viewComponentSelector.SelectComponent(contentAlias);

            string partialPath;
            if (isGrid)
            {
                partialPath = $"/Views/Partials/blockgrid/Components/{contentAlias}.cshtml";
            }
            else
            {
                partialPath = $"/Views/Partials/blocklist/Components/{contentAlias}.cshtml";
            }

            if (viewComponent != null)
            {
                return await GetMarkupFromViewComponent(controllerContext, viewData, viewComponent);
            }

            return await GetMarkupFromPartial(controllerContext, viewData, partialPath);
        }

        private async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            string viewName)
        {
            var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());
            await using var sw = new StringWriter();
            var viewResult = _razorViewEngine.GetView(viewName, viewName, false);
            if (viewResult?.View != null)
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

        private sealed class FakeView : IView
        {
            public string Path => string.Empty;

            public Task RenderAsync(ViewContext context)
            {
                return Task.CompletedTask;
            }
        }
    }
}
