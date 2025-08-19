using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace Umbraco.Cms._13.x.ViewComponents
{
    [ViewComponent(Name = HeroBlock.ModelTypeAlias)]
    public class HeroBlockComponent : ViewComponent
    {
        public IViewComponentResult Invoke(BlockGridItem<HeroBlock, BlockSettings> model)
        {
            return View(model);
        }
    }
}
