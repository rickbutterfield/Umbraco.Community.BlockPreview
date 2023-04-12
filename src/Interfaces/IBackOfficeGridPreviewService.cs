using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBackOfficeGridPreviewService : IBackOfficePreviewService
    {
        Task<string> GetMarkupForBlock(
            BlockValue blockValue,
            ControllerContext controllerContext,
            string culture);
    }
}
