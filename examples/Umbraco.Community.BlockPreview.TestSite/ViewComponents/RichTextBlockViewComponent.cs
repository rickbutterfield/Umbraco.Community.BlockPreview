using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco.Community.BlockPreview.TestSite.ViewComponents
{
    /// <summary>
    /// Example ViewComponent using a strongly typed camelCase naming convention.
    /// </summary>
    [ViewComponent(Name = RichTextBlock.ModelTypeAlias)]
    public class RichTextBlockViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<RichTextBlock> model)
        {
            return View(model);
        }
    }
}