using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBlockPreviewService
    {
        Task<string> RenderGridBlock(string blockData, IPublishedContent content, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentKey = "", string? settingsKey = default, int? blockIndex = 0);

        Task<string> RenderListBlock(string blockData, IPublishedContent content, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default, string contentKey = "", string? settingsKey = default, int? blockIndex = 0);

        Task<string> RenderRichTextBlock(string blockData, IPublishedContent content, ControllerContext controllerContext, string blockEditorAlias = "", Guid documentTypeUnique = default);

        Task<string?> GetStylesheetPath(BlockType blockType, IPublishedContent content, ControllerContext controllerContext);
    }
}
