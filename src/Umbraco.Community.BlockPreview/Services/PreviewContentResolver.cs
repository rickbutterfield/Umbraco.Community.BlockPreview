using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.HybridCache;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <inheritdoc cref="IPreviewContentResolver" />
    public class PreviewContentResolver : IPreviewContentResolver
    {
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILanguageService _languageService;
        private readonly ContextCultureService _contextCultureService;
        private readonly IPublishedContentTypeCache _contentTypeCache;
        private readonly IDocumentCacheService _documentCacheService;
        private readonly IScopeProvider _scopeProvider;
        private readonly IAppPolicyCache _runtimeCache;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        public PreviewContentResolver(
            IUmbracoContextAccessor umbracoContextAccessor,
            IPublishedRouter publishedRouter,
            ILanguageService languageService,
            ContextCultureService contextCultureService,
            IPublishedContentTypeCache contentTypeCache,
            IDocumentCacheService documentCacheService,
            IScopeProvider scopeProvider,
            IAppPolicyCache runtimeCache)
        {
            _umbracoContextAccessor = umbracoContextAccessor;
            _publishedRouter = publishedRouter;
            _languageService = languageService;
            _contextCultureService = contextCultureService;
            _contentTypeCache = contentTypeCache;
            _documentCacheService = documentCacheService;
            _scopeProvider = scopeProvider;
            _runtimeCache = runtimeCache;
        }

        /// <inheritdoc />
        public IPublishedContent? Resolve(Guid? nodeKey, Guid? documentTypeUnique, out bool isActualContent)
        {
            isActualContent = false;

            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            IPublishedContent? content = null;

            if (nodeKey.HasValue)
            {
                content = context.Content?.GetById(preview: true, nodeKey.GetValueOrDefault());
            }

            if (content != null)
            {
                isActualContent = true;
                return content;
            }

            var publishedContentType = _contentTypeCache.Get(PublishedItemType.Content, documentTypeUnique.GetValueOrDefault());

            if (publishedContentType == null)
                return null;

            var contentCacheKey = string.Format(Constants.CacheKeys.Content, nodeKey);
            using var scope = _scopeProvider.CreateScope();
            var cacheItem = _runtimeCache.GetCacheItem(contentCacheKey, () =>
            {
                return _documentCacheService.GetByContentType(publishedContentType).FirstOrDefault();
            }, CacheDuration);
            scope.Complete();
            return cacheItem;
        }

        /// <inheritdoc />
        public async Task<string?> ResolveCultureAsync(string? requestedCulture, IPublishedContent? content)
        {
            var currentCulture = string.IsNullOrWhiteSpace(requestedCulture) || requestedCulture == "undefined"
                ? null
                : requestedCulture;

            currentCulture ??= content?.GetCultureFromDomains();

            if (string.IsNullOrEmpty(currentCulture))
            {
                var allLanguages = await _languageService.GetAllAsync();
                var languages = allLanguages.ToList();
                currentCulture = languages.Count == 1
                    ? languages[0].IsoCode
                    : await _languageService.GetDefaultIsoCodeAsync();
            }

            _contextCultureService.SetCulture(currentCulture);

            return currentCulture;
        }

        /// <inheritdoc />
        public async Task SetupPublishedRequestAsync(string? culture, IPublishedContent? content, Uri requestUrl)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return;

            var requestBuilder = await _publishedRouter.CreateRequestAsync(requestUrl);

            if (content != null)
                requestBuilder.SetPublishedContent(content);

            context.PublishedRequest = requestBuilder.Build();
        }
    }
}
