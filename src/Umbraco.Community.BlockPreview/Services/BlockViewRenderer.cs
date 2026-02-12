using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using System.Text.Encodings.Web;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Service for rendering block preview views.
    /// </summary>
    public class BlockViewRenderer : IBlockViewRenderer
    {
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly IViewComponentSelector _viewComponentSelector;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockViewRenderer"/> class.
        /// </summary>
        /// <param name="tempDataProvider">The temp data provider.</param>
        /// <param name="viewComponentHelperWrapper">The view component helper wrapper.</param>
        /// <param name="razorViewEngine">The Razor view engine.</param>
        /// <param name="viewComponentSelector">The view component selector.</param>
        public BlockViewRenderer(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            IViewComponentSelector viewComponentSelector)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _viewComponentSelector = viewComponentSelector;
        }

        /// <inheritdoc/>
        public async Task<string> RenderAsync(BlockPreviewContext context, ViewEngineResult? viewResult = null)
        {
            // Try ViewComponent first
            var viewComponentResult = await RenderViewComponentAsync(context);
            if (viewComponentResult != null)
                return viewComponentResult;

            // Fall back to partial view
            if (viewResult == null || !viewResult.Success)
            {
                viewResult = _razorViewEngine.FindView(context.ControllerContext, context.ContentAlias!, false);

                if (!viewResult.Success)
                    viewResult = _razorViewEngine.FindView(context.ControllerContext, context.ContentAlias?.ToPascalCase()!, false);
            }

            if (!viewResult.Success || viewResult.View == null)
            {
                return string.Format(
                    Constants.ErrorMessages.WarningTemplate,
                    string.Format(
                        Constants.ErrorMessages.ViewNotFound,
                        viewResult.ViewName,
                        string.Join("<br/>", viewResult.SearchedLocations ?? Array.Empty<string>())));
            }

            return await RenderPartialAsync(context, viewResult);
        }

        /// <inheritdoc/>
        public async Task<string> RenderPartialAsync(BlockPreviewContext context, ViewEngineResult viewResult)
        {
            if (viewResult.View == null)
            {
                return string.Format(
                    Constants.ErrorMessages.WarningTemplate,
                    string.Format(
                        Constants.ErrorMessages.ViewNotFound,
                        viewResult.ViewName,
                        string.Join("<br/>", viewResult.SearchedLocations ?? Array.Empty<string>())));
            }

            var actionContext = new ActionContext(
                context.ControllerContext.HttpContext,
                new RouteData(),
                new ActionDescriptor());

            var sw = new StringWriter();

            if (context.ViewData != null)
            {
                var viewContext = new ViewContext(
                    actionContext,
                    viewResult.View,
                    context.ViewData,
                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider),
                    sw,
                    new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);
            }

            return sw.ToString();
        }

        /// <inheritdoc/>
        public async Task<string?> RenderViewComponentAsync(BlockPreviewContext context)
        {
            // ViewComponents can be registered with PascalCase (default) or camelCase (ModelTypeAlias)
            var viewComponent = _viewComponentSelector.SelectComponent(context.ContentAlias?.ToPascalCase());
            viewComponent ??= _viewComponentSelector.SelectComponent(context.ContentAlias?.ToCamelCase());

            if (viewComponent == null)
                return null;

            var sw = new StringWriter();
            var viewContext = new ViewContext(
                context.ControllerContext,
                new FakeView(),
                context.ViewData!,
                new TempDataDictionary(context.ControllerContext.HttpContext, _tempDataProvider),
                sw,
                new HtmlHelperOptions());

            _viewComponentHelperWrapper.Contextualize(viewContext);

            var result = await _viewComponentHelperWrapper.InvokeAsync(
                viewComponent.TypeInfo.AsType(),
                context.ViewData?.Model);

            result.WriteTo(sw, HtmlEncoder.Default);
            return sw.ToString();
        }

        private sealed class FakeView : IView
        {
            public string Path => string.Empty;

            public Task RenderAsync(ViewContext context) => Task.CompletedTask;
        }
    }
}
