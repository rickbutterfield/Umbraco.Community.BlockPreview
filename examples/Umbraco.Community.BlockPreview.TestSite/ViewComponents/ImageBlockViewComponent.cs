using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco.Community.BlockPreview.TestSite.ViewComponents
{
    /// <summary>
    /// Example ViewComponent using a weakly typed PascalCase naming convention.
    /// </summary>
    [ViewComponent(Name = "ImageBlock")]
    public class ImageBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<ImageBlock> model)
        {
            return View(model);
        }
    }
}