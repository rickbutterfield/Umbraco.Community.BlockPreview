using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Collections.Generic;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Extensions
{
    public static class BlockGridPreviewTemplateExtensions
    {
        private static readonly string AREA_TEMPLATE = "<umb-block-grid-render-area-slots></umb-block-grid-render-area-slots>";

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreasHtmlAsync(this IHtmlHelper html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreasTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreasHtmlAsync(item, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreasHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreasTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreasHtmlAsync(item, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper html, BlockGridArea area, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreaHtmlAsync(area, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridArea area, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml(AREA_TEMPLATE)
                    );
            }

            return await html.GetBlockGridItemAreaHtmlAsync(area, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml($"<slot name=\"{template}\"></slot>")
                    );
            }

            return await html.GetBlockGridItemAreaHtmlAsync(item, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreaHtmlAsync(this IHtmlHelper<dynamic> html, BlockGridItem item, string template = BlockGridTemplateExtensions.DefaultItemAreaTemplate)
        {
            if (html.ViewData.IsBlockPreview())
            {
                return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml($"<slot name=\"{template}\"></slot>")
                    );
            }

            return await html.GetBlockGridItemAreaHtmlAsync(item, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemsHtmlAsync(this IHtmlHelper html, IEnumerable<BlockGridItem> items, string template = BlockGridTemplateExtensions.DefaultItemsTemplate)
        {
            return await html.GetBlockGridItemsHtmlAsync(items, template);
        }

        public static async Task<IHtmlContent> GetPreviewBlockGridItemsHtmlAsync(this IHtmlHelper<dynamic> html, IEnumerable<BlockGridItem> items, string template = BlockGridTemplateExtensions.DefaultItemsTemplate)
        {
            return await html.GetBlockGridItemsHtmlAsync(items, template);
        }

        private static bool IsBlockPreview(this ViewDataDictionary viewData)
        {
            if (viewData.ContainsKey("blockPreview"))
                if (bool.TryParse(viewData["blockPreview"].ToString(), out bool isBlockPreview))
                    return isBlockPreview;

            return false;
        }
    }
}
