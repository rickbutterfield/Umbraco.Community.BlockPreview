using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// The inputs common to every "preview/*" controller action.
    /// </summary>
    /// <param name="BlockData">The JSON content data of the block.</param>
    /// <param name="NodeKey">The <see cref="Guid"/> that represents the Umbraco node.</param>
    /// <param name="BlockEditorAlias">The alias of the block editor.</param>
    /// <param name="ContentElementAlias">The alias of the content being rendered.</param>
    /// <param name="Culture">The requested render culture.</param>
    /// <param name="DocumentTypeUnique">The <see cref="Guid"/> that represents the Umbraco document type.</param>
    /// <param name="ContentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element.</param>
    /// <param name="SettingsUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element.</param>
    /// <param name="BlockIndex">The <see cref="int"/> that represents the block index.</param>
    /// <param name="HttpContext">The current HTTP context.</param>
    /// <param name="ControllerContext">The current controller context.</param>
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
        /// <summary>
        /// Runs the shared preview request pipeline for a single controller action.
        /// </summary>
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
