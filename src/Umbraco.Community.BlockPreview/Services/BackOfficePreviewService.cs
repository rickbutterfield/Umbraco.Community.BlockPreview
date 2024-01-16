using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    public class BackOfficePreviewService : IBackOfficePreviewService
    {
        private readonly ITempDataProvider _tempDataProvider;
        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly BlockPreviewOptions _options;

        public BackOfficePreviewService(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            IOptions<BlockPreviewOptions> options)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
            _options = options.Value;
        }

        public virtual async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            string contentAlias,
            bool isGrid = false)
        {
            var viewPaths = isGrid ? _options.ViewLocations.BlockGrid : _options.ViewLocations.BlockList;

            foreach (var viewPath in viewPaths)
            {
                string formattedViewPath = string.Format($"~{viewPath}", contentAlias);
                ViewEngineResult viewResult = _razorViewEngine.GetView("", formattedViewPath, false);

                if (!viewResult.Success)
                {
                    
                     formattedViewPath = string.Format($"~{viewPath}", contentAlias.ToPascalCase());
                         viewResult = _razorViewEngine.GetView("", formattedViewPath, false);
                         if (!viewResult.Success)
                         {
                             continue;
                         }
                }


                var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());
                if (viewResult?.View == null)
                    continue;

                await using var sw = new StringWriter();

                var viewContext = new ViewContext(actionContext, viewResult.View, viewData,
                    new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                await viewResult.View.RenderAsync(viewContext);

                return sw.ToString();
            }

            return string.Empty;
        }

        public virtual async Task<string> GetMarkupFromViewComponent(
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