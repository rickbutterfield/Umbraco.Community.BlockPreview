using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Service for caching content types and data types.
    /// </summary>
    public class BlockTypeCacheService : IBlockTypeCacheService
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IDataTypeService _dataTypeService;
        private readonly IAppPolicyCache _runtimeCache;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockTypeCacheService"/> class.
        /// </summary>
        /// <param name="contentTypeService">The content type service.</param>
        /// <param name="dataTypeService">The data type service.</param>
        /// <param name="appCaches">The application caches.</param>
        public BlockTypeCacheService(
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            AppCaches appCaches)
        {
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
            _runtimeCache = appCaches.RuntimeCache;
        }

        /// <inheritdoc/>
        public IContentType? GetContentType(Guid documentTypeUnique)
        {
            var cacheKey = string.Format(Constants.CacheKeys.ContentType, documentTypeUnique);
            return _runtimeCache.GetCacheItem(cacheKey, () =>
            {
                return _contentTypeService.Get(documentTypeUnique);
            }, CacheDuration);
        }

        /// <inheritdoc/>
        public async Task<IDataType?> GetDataType(Guid dataTypeKey)
        {
            var cacheKey = string.Format(Constants.CacheKeys.DataType, dataTypeKey);
            return await _runtimeCache.GetCacheItemAsync(cacheKey, async () =>
            {
                IDataType? dataType = await _dataTypeService.GetAsync(dataTypeKey);
                return dataType;
            }, CacheDuration);
        }
    }
}
