using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Extensions
{
    /// <summary>
    /// Extension methods for rendering block preview templates.
    /// </summary>
    public static class BlockPreviewTemplateExtensions
    {
        private static readonly string AREA_TEMPLATE =
            "<umb-block-grid-areas-container slot=\"areas\"></umb-block-grid-areas-container>";

        /// <summary>
        /// Gets the HTML for block grid item areas with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="item">The block grid item.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreasHtmlAsync(this IHtmlHelper html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreasTemplate)
        {
            if (html.ViewData.IsBlockGridPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreasHtmlAsync(item, template);
        }

        /// <summary>
        /// Gets the HTML for block grid item areas with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="item">The block grid item.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreasHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreasTemplate)
        {
            if (html.ViewData.IsBlockGridPreview() && !html.ViewData.HasNestedBlockGrid())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreasHtmlAsync(item, template);
        }

        /// <summary>
        /// Gets the HTML for a block grid item area with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="area">The block grid area.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper html, BlockGridArea area, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockGridPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreaHtmlAsync(area, template);
        }

        /// <summary>
        /// Gets the HTML for a block grid item area with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="area">The block grid area.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridArea area, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockGridPreview())
            {
                var matchingBlockConfig = html.ViewData["matchingBlockConfig"];

                if (matchingBlockConfig is not null && matchingBlockConfig is BlockGridConfiguration.BlockGridBlockConfiguration blockConfig)
                {
                    var matchingArea = blockConfig.Areas.FirstOrDefault(x => x.Alias == area.Alias);

                    if (matchingArea != null)
                    {
                        return await Task.FromResult<IHtmlContent>(
                            new HtmlContentBuilder()
                                .AppendHtml($"<umb-block-grid-entries part=\"area\" class=\"umb-block-grid__area\" area-key=\"{matchingArea.Key}\"></umb-block-grid-entries>")
                        );
                    }
                }
            }

            return await html.GetBlockGridItemAreaHtmlAsync(area, template);
        }

        /// <summary>
        /// Gets the HTML for a block grid item area with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="item">The block grid item.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockGridPreview())
            {
                var matchingBlockConfig = html.ViewData["matchingBlockConfig"];

                if (item.Areas.Any() && matchingBlockConfig is not null && matchingBlockConfig is BlockGridConfiguration.BlockGridBlockConfiguration blockConfig)
                {
                    var matchingArea = blockConfig.Areas.FirstOrDefault(x => x.Alias == template);

                    if (matchingArea != null)
                    {
                        return await Task.FromResult<IHtmlContent>(
                                new HtmlContentBuilder()
                                    .AppendHtml($"<umb-block-grid-entries part=\"area\" class=\"umb-block-grid__area\" area-key=\"{matchingArea.Key}\"></umb-block-grid-entries>")
                            );
                    }
                }
            }

            return await html.GetBlockGridItemAreaHtmlAsync(item, template);
        }

        /// <summary>
        /// Gets the HTML for a block grid item area with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="item">The block grid item.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockGridPreview())
            {
                var matchingBlockConfig = html.ViewData["matchingBlockConfig"];

                if (item.Areas.Any() && matchingBlockConfig is not null && matchingBlockConfig is BlockGridConfiguration.BlockGridBlockConfiguration blockConfig)
                {
                    var matchingArea = blockConfig.Areas.FirstOrDefault(x => x.Alias == template);

                    if (matchingArea != null)
                    {
                        return await Task.FromResult<IHtmlContent>(
                                new HtmlContentBuilder()
                                    .AppendHtml($"<umb-block-grid-entries part=\"area\" class=\"umb-block-grid__area\" area-key=\"{matchingArea.Key}\"></umb-block-grid-entries>")
                            );
                    }
                }
            }

            return await html.GetBlockGridItemAreaHtmlAsync(item, template);
        }

        /// <summary>
        /// Gets the HTML for block grid items with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="items">The block grid items.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemsHtmlAsync(this IHtmlHelper html, IEnumerable<BlockGridItem> items, string template = BlockGridTemplateExtensions.DefaultItemsTemplate)
        {
            return await html.GetBlockGridItemsHtmlAsync(items, template);
        }

        /// <summary>
        /// Gets the HTML for block grid items with preview support.
        /// </summary>
        /// <param name="html">The HTML helper.</param>
        /// <param name="items">The block grid items.</param>
        /// <param name="template">The template to use.</param>
        /// <returns>The HTML content.</returns>
        public static async Task<IHtmlContent> GetPreviewBlockGridItemsHtmlAsync(this IHtmlHelper<dynamic> html, IEnumerable<BlockGridItem> items, string template = BlockGridTemplateExtensions.DefaultItemsTemplate)
        {
            return await html.GetBlockGridItemsHtmlAsync(items, template);
        }

        private static bool IsBlockPreview(this ViewDataDictionary viewData)
        {
            if (viewData.ContainsKey("blockPreview"))
                if (bool.TryParse(viewData["blockPreview"]?.ToString(), out bool isBlockPreview))
                    return isBlockPreview;

            return false;
        }

        private static bool IsBlockGridPreview(this ViewDataDictionary viewData)
        {
            if (viewData.ContainsKey("blockGridPreview"))
                if (bool.TryParse(viewData["blockGridPreview"]?.ToString(), out bool isBlockPreview))
                    return isBlockPreview;

            return false;
        }

        private static bool HasNestedBlockGrid(this ViewDataDictionary viewData)
        {
            if (viewData.ContainsKey("blockGridNested"))
                if (bool.TryParse(viewData["blockGridNested"]?.ToString(), out bool hasBlockGridNested))
                    return hasBlockGridNested;

            return false;
        }
    }
}
