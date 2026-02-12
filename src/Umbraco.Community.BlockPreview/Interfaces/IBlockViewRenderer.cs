using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Service for rendering block preview views.
    /// </summary>
    public interface IBlockViewRenderer
    {
        /// <summary>
        /// Renders a block preview using either a ViewComponent or partial view.
        /// </summary>
        /// <param name="context">The block preview context.</param>
        /// <param name="viewResult">Optional pre-resolved view result. If null, will attempt to find a ViewComponent or use FindView.</param>
        /// <returns>The rendered HTML markup.</returns>
        Task<string> RenderAsync(BlockPreviewContext context, ViewEngineResult? viewResult = null);

        /// <summary>
        /// Renders a partial view.
        /// </summary>
        /// <param name="context">The block preview context.</param>
        /// <param name="viewResult">The view engine result.</param>
        /// <returns>The rendered HTML markup.</returns>
        Task<string> RenderPartialAsync(BlockPreviewContext context, ViewEngineResult viewResult);

        /// <summary>
        /// Renders a ViewComponent.
        /// </summary>
        /// <param name="context">The block preview context.</param>
        /// <returns>The rendered HTML markup, or null if no ViewComponent was found.</returns>
        Task<string?> RenderViewComponentAsync(BlockPreviewContext context);
    }
}
