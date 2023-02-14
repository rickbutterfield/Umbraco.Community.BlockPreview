using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBackOfficePreviewService
    {
        Task<string> GetMarkupForBlock(
            BlockItemData contentData,
            BlockItemData settingsData,
            bool isGrid,
            ControllerContext controllerContext);
    }
}
