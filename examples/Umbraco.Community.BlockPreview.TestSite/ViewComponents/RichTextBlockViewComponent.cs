using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco.Community.BlockPreview.TestSite.ViewComponents
{
    // Example of a View Component with its name defined using the Models constant in the camel case format
    [ViewComponent(Name = RichTextBlock.ModelTypeAlias)]
    public class RichTextBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<RichTextBlock> model)
        {
            return View(model);
        }
    }
}