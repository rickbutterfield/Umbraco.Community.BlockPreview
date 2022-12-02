using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Extensions;

namespace Our.Umbraco.BlockPreview.Extensions
{
    public static class BlockGridPreviewTemplateExtensions
    {
        public const string DefaultItemAreasTemplate = "areas";

        public static async Task<IHtmlContent> GetPreviewBlockGridItemAreasHtmlAsync(this IHtmlHelper html, BlockGridItem item, string template = DefaultItemAreasTemplate)
        {
            if (html.ViewData.ContainsKey("blockGridPreview"))
            {
                if ((bool)html.ViewData["blockGridPreview"] == true)
                {
                    return await Task.FromResult<IHtmlContent>(
                        new HtmlContentBuilder()
                            .AppendHtml("<umb-block-grid-render-area-slots></umb-block-grid-render-area-slots>")
                    );
                }
            }

            return await html.GetBlockGridItemAreasHtmlAsync(item, template);
        }
    }
}
