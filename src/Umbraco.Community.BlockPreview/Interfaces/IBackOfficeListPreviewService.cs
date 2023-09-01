using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBackOfficeListPreviewService : IBackOfficePreviewService
    {
        Task<string> GetMarkupForBlock(
            IPublishedContent page,
            BlockValue blockValue,
            string blockGridAlias,
            ControllerContext controllerContext,
            string culture);
    }
}
