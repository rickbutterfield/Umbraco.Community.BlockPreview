using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBackOfficePreviewService
    {
        void ConvertNestedValuesToString(BlockItemData? contentData);
        Type? FindBlockType(string? contentTypeAlias);
        ViewDataDictionary CreateViewData(object? typedBlockInstance);
        Task<string> GetMarkup(ControllerContext controllerContext, string contentAlias, ViewDataDictionary viewData, bool isGrid = false);
        Task<string> GetMarkupForBlock<T>(IPublishedContent page, BlockValue<T> blockValue, string blockEditorAlias, ControllerContext controllerContext, string? culture) where T : IBlockLayoutItem;
        Task<string> GetMarkupFromViewComponent(ControllerContext controllerContext, ViewDataDictionary viewData, ViewComponentDescriptor viewComponent);
    }
}
