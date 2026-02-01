using System.Collections.Concurrent;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Options;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Extensions;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Resolves and caches view results for block previews.
    /// </summary>
    public class BlockPreviewViewResolver : IBlockPreviewViewResolver
    {
        private static readonly ConcurrentDictionary<string, ViewEngineResult?> _viewCache = new();

        private readonly IRazorViewEngine _razorViewEngine;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly BlockPreviewOptions _options;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewViewResolver"/> class.
        /// </summary>
        /// <param name="razorViewEngine">The Razor view engine.</param>
        /// <param name="webHostEnvironment">The web host environment.</param>
        /// <param name="options">The block preview options.</param>
        public BlockPreviewViewResolver(
            IRazorViewEngine razorViewEngine,
            IWebHostEnvironment webHostEnvironment,
            IOptions<BlockPreviewOptions> options)
        {
            _razorViewEngine = razorViewEngine;
            _webHostEnvironment = webHostEnvironment;
            _options = options.Value;
        }

        /// <inheritdoc/>
        public ViewEngineResult? ResolveView(string contentAlias, BlockType blockType)
        {
            if (string.IsNullOrEmpty(contentAlias))
                return null;

            var cacheKey = BuildCacheKey(contentAlias, blockType);

            return _viewCache.GetOrAdd(cacheKey, _ => FindView(contentAlias, blockType));
        }

        /// <inheritdoc/>
        public void ClearCache() => _viewCache.Clear();

        /// <inheritdoc/>
        public void ClearCacheForAlias(string contentAlias)
        {
            if (string.IsNullOrEmpty(contentAlias))
                return;

            // Clear cache entries for all block types for this alias
            foreach (BlockType blockType in Enum.GetValues<BlockType>())
            {
                var cacheKey = BuildCacheKey(contentAlias, blockType);
                _viewCache.TryRemove(cacheKey, out _);

                // Also clear PascalCase variant if different
                var pascalAlias = contentAlias.ToPascalCase();
                if (pascalAlias != contentAlias)
                {
                    var pascalCacheKey = BuildCacheKey(pascalAlias, blockType);
                    _viewCache.TryRemove(pascalCacheKey, out _);
                }
            }
        }

        private static string BuildCacheKey(string contentAlias, BlockType blockType)
            => $"{blockType}:{contentAlias}";

        private ViewEngineResult? FindView(string contentAlias, BlockType blockType)
        {
            var viewPaths = _options.GetViewLocations(blockType);

            if (viewPaths == null || viewPaths.Count == 0)
                return null;

            string appRoot = _webHostEnvironment.ContentRootPath;

            foreach (var viewPath in viewPaths)
            {
                string baseViewPath = viewPath.TrimStart('~', Path.DirectorySeparatorChar, '/');

                // Try non-PascalCase first
                var pathNonPascal = string.Format(baseViewPath, contentAlias);
                var viewPathNonPascal = Path.Combine(appRoot, pathNonPascal);

                if (File.Exists(viewPathNonPascal))
                {
                    var viewResult = _razorViewEngine.GetView("", pathNonPascal, false);
                    if (viewResult.Success)
                        return viewResult;
                }

                // Try PascalCase
                var pascalAlias = contentAlias.ToPascalCase();
                var pathPascal = string.Format(baseViewPath, pascalAlias);
                var viewPathPascal = Path.Combine(appRoot, pathPascal);

                if (File.Exists(viewPathPascal))
                {
                    var viewResult = _razorViewEngine.GetView("", pathPascal, false);
                    if (viewResult.Success)
                        return viewResult;
                }
            }

            return null;
        }
    }
}
