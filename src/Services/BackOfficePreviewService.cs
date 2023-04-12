using System.IO;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Umbraco.Community.BlockPreview.Interfaces;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.Globalization;
using System.Threading;

namespace Umbraco.Community.BlockPreview.Services
{
    public class BackOfficePreviewService : IBackOfficePreviewService
    {
        private readonly ITempDataProvider _tempDataProvider;

        private readonly IViewComponentHelperWrapper _viewComponentHelperWrapper;

        private readonly IRazorViewEngine _razorViewEngine;

        public BackOfficePreviewService(
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine)
        {
            _tempDataProvider = tempDataProvider;
            _viewComponentHelperWrapper = viewComponentHelperWrapper;
            _razorViewEngine = razorViewEngine;
        }

        public virtual void SetCulture(string culture)
        {
            var cultureInfo = new CultureInfo(culture);
            Thread.CurrentThread.CurrentCulture = cultureInfo;
            Thread.CurrentThread.CurrentUICulture = cultureInfo;
        }

        public virtual async Task<string> GetMarkupFromPartial(
            ControllerContext controllerContext,
            ViewDataDictionary viewData,
            string contentAlias)
        {
            ViewEngineResult viewResult = _razorViewEngine.FindView(controllerContext, contentAlias, false);

            if (viewResult.Success)
            {
                var actionContext = new ActionContext(controllerContext.HttpContext, new RouteData(), new ActionDescriptor());
                await using var sw = new StringWriter();
                if (viewResult?.View != null)
                {
                    var viewContext = new ViewContext(actionContext, viewResult.View, viewData,
                        new TempDataDictionary(actionContext.HttpContext, _tempDataProvider), sw, new HtmlHelperOptions());

                    await viewResult.View.RenderAsync(viewContext);
                }

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
