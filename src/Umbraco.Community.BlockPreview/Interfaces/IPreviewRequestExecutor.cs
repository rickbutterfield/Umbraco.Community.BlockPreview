using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// The inputs common to every "preview/*" controller action.
    /// </summary>
    public sealed record PreviewRenderRequest(
        string BlockData,
        Guid NodeKey,
        string BlockEditorAlias,
        string ContentElementAlias,
        string? Culture,
        Guid DocumentTypeUnique,
        string? ContentUdi,
        string? SettingsUdi,
        int? BlockIndex,
        HttpContext HttpContext,
        ControllerContext ControllerContext);

    /// <summary>
    /// Runs the shared preview request pipeline: verify generated models exist, resolve
    /// content and culture, enrich the request, invoke the block-type-specific renderer,
    /// enrich the response, and fall back to an error template on any failure.
    /// </summary>
    public interface IPreviewRequestExecutor
    {
        /// <param name="request">The common preview request inputs.</param>
        /// <param name="render">
        /// The block-type-specific render call, e.g. <c>blockPreviewService.RenderGridBlock</c>.
        /// Parameters match <see cref="IBlockPreviewService.RenderGridBlock"/>'s order:
        /// (blockData, content, controllerContext, blockEditorAlias, documentTypeUnique, contentKey, settingsKey, blockIndex).
        /// </param>
        /// <returns>The rendered (unsanitized) markup, or an error/warning template.</returns>
        Task<string> ExecuteAsync(
            PreviewRenderRequest request,
            Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>> render);
    }
}
