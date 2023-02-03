using Our.Umbraco.BlockPreview.Controllers;
using Umbraco.Cms.Core.Web;
using HttpContext = Microsoft.AspNetCore.Http.HttpContext;

namespace Our.Umbraco.BlockPreview.Extensions
{
    public static class UmbracoContextExtensions
    {
        public static bool IsBlockPreview(this IUmbracoContext umbracoContext, HttpContext httpContext)
        {
            var requestControllerName = (string)httpContext.Request.RouteValues["controller"] + "Controller";
            if (requestControllerName.Equals	(nameof(BlockPreviewApiController)) && httpContext.Request.RouteValues["action"].Equals	(nameof(BlockPreviewApiController.PreviewMarkup)))
            {
                return true;
            }
            return false;
        }
    }
}
