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
            var routeValues = request.HttpContext.Request.RouteValues;

            if (!routeValues.TryGetValue("controller", out var controllerValue) ||
                !routeValues.TryGetValue("action", out var actionValue))
            {
                return false;
            }

            string requestControllerName = (string)controllerValue! + "Controller";

            bool requestControllerMatches = requestControllerName.Equals(nameof(BlockPreviewApiController));
            bool isBlockGridPreview = actionValue!.Equals(nameof(BlockPreviewApiController.PreviewGridBlock));
            bool isBlockListPreview = actionValue.Equals(nameof(BlockPreviewApiController.PreviewListBlock));
            bool isRichTextPreview = actionValue.Equals(nameof(BlockPreviewApiController.PreviewRichTextMarkup));

            return requestControllerMatches && (isBlockGridPreview || isBlockListPreview || isRichTextPreview);
        }
    }
}
