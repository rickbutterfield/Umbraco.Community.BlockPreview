using System;
using Umbraco.Cms.Core.Web;

namespace Our.Umbraco.BlockPreview.Extensions
{
    public static class UmbracoContextExtensions
    {
        public static bool IsBlockPreview(this IUmbracoContext umbracoContext)
        {
            if (umbracoContext.OriginalRequestUrl.LocalPath.Contains("blockpreviewapi",
                    StringComparison.InvariantCultureIgnoreCase))
            {
                return true;
            }

            return false;
        }
    }
}
