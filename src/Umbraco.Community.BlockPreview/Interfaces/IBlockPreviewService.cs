using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBlockPreviewService
    {
        Task<string> RenderGridBlock(BlockValue blockData, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default, int? blockIndex = 0);

        Task<string> RenderListBlock(BlockValue blockData, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentUdi = "", string? settingsUdi = default, int? blockIndex = 0);

#if NET8_0
        Task<string> RenderRichTextBlock(BlockValue blockData, ControllerContext controllerContext);
#endif

        IContentType? GetContentType(Guid documentTypeUnique);
    }
}
