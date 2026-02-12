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
        /// <summary>
        /// Invokes the view component to render a block grid item containing rich text content.
        /// </summary>
        /// <param name="model">The block grid item model that provides the rich text content to be rendered in the view. Cannot be null.</param>
        /// <returns>An instance of <see cref="IViewComponentResult"/> that renders the view using the specified block grid item
        /// model.</returns>
        public IViewComponentResult Invoke(BlockGridItem<RichTextBlock> model)
        {
            return View(model);
        }
    }
}