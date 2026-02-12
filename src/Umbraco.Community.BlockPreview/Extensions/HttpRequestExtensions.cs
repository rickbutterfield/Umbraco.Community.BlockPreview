using Microsoft.AspNetCore.Http;
using Umbraco.Community.BlockPreview.Controllers;

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

            string requestControllerName = (string)httpContext.Request.RouteValues["controller"]! + "Controller";

            bool requestControllerMatches = requestControllerName.Equals(nameof(BlockPreviewApiController));
            bool isBlockGridPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewGridBlock));
            bool isBlockListPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewListBlock));
            bool isRichTextPreview = httpContext.Request.RouteValues["action"]!.Equals(nameof(BlockPreviewApiController.PreviewRichTextMarkup));

            return requestControllerMatches && (isBlockGridPreview || isBlockListPreview || isRichTextPreview);
        }
    }
}
