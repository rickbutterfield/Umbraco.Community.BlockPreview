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
        /// <summary>
        /// Invokes the view component to render an image block using the specified block grid item model.
        /// </summary>
        /// <param name="model">The block grid item containing image data to be rendered by the view component. Cannot be null.</param>
        /// <returns>An instance of <see cref="IViewComponentResult"/> that represents the rendered image block view.</returns>
        public IViewComponentResult Invoke(BlockGridItem<ImageBlock> model)
        {
            return View(model);
        }
    }
}