using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco.Community.BlockPreview.TestSite.ViewComponents
{
    // Example of a View Component with its name in the default First Letter Uppercase format 
    [ViewComponent(Name = "ImageBlock")]
    public class ImageBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<ImageBlock> model)
        {
            return View(model);
        }
    }
}