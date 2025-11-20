using Microsoft.AspNetCore.Http;
using Umbraco.Community.BlockPreview.Controllers;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Extensions
{
    /// <summary>
    /// Extension methods for HTTP requests.
    /// </summary>
    public static class HttpRequestExtensions
    {
        /// <summary>
        /// Determines whether the HTTP request is a Block Preview request.
        /// </summary>
        /// <param name="request">The HTTP request.</param>
        /// <returns>True if the request is a Block Preview request; otherwise, false.</returns>
        public static bool IsBlockPreviewRequest(this HttpRequest request)
        {
            var httpContext = request.HttpContext;

            // We're always going to be coming from the back office so let's check that
            bool isBackOffice = request.IsBackOfficeRequest();

            string requestControllerName = (string)httpContext.Request.RouteValues["controller"]! + "Controller";

            bool requestControllerMatches = requestControllerName.Equals(nameof(BlockPreviewApiController));
            bool isBlockGridPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewGridBlock));
            bool isBlockListPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewListBlock));
            bool isRichTextPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewRichTextMarkup));

            bool isBlockPreviewController = requestControllerMatches && (isBlockGridPreview || isBlockListPreview || isRichTextPreview);

            return isBackOffice && isBlockPreviewController;
        }
    }
}
