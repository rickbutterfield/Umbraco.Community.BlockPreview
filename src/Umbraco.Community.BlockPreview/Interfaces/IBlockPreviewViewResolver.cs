using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Resolves and caches view results for block previews.
    /// </summary>
    public interface IBlockPreviewViewResolver
    {
        /// <summary>
        /// Resolves a view for the given content alias and block type.
        /// </summary>
        /// <param name="contentAlias">The content type alias.</param>
        /// <param name="blockType">The block type.</param>
        /// <returns>A <see cref="ViewEngineResult"/> if a view is found; otherwise, <see langword="null"/>.</returns>
        ViewEngineResult? ResolveView(string contentAlias, BlockType blockType);

        /// <summary>
        /// Clears the view resolution cache.
        /// </summary>
        void ClearCache();

        /// <summary>
        /// Clears the cached view for a specific content alias.
        /// </summary>
        /// <param name="contentAlias">The content type alias to clear from cache.</param>
        void ClearCacheForAlias(string contentAlias);
    }
}
