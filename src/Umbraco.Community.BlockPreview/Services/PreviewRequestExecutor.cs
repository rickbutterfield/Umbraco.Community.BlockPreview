using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <inheritdoc cref="IPreviewRequestExecutor" />
    public class PreviewRequestExecutor : IPreviewRequestExecutor
    {
        private readonly IPreviewContentResolver _contentResolver;
        private readonly IBlockPreviewRequestEnricher _requestEnricher;
        private readonly IBlockPreviewResponseEnricher _responseEnricher;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly ITypeFinder _typeFinder;
        private readonly ILogger<PreviewRequestExecutor> _logger;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the <see cref="PreviewRequestExecutor"/> class.
        /// </summary>
        public PreviewRequestExecutor(
            IPreviewContentResolver contentResolver,
            IBlockPreviewRequestEnricher requestEnricher,
            IBlockPreviewResponseEnricher responseEnricher,
            IAppPolicyCache runtimeCache,
            ITypeFinder typeFinder,
            ILogger<PreviewRequestExecutor> logger)
        {
            _contentResolver = contentResolver;
            _requestEnricher = requestEnricher;
            _responseEnricher = responseEnricher;
            _runtimeCache = runtimeCache;
            _typeFinder = typeFinder;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<string> ExecuteAsync(
            PreviewRenderRequest request,
            Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>> render)
        {
            if (!CheckGeneratedModelsExist())
                return string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.ModelsBuilderError);

            try
            {
                IPublishedContent? content = _contentResolver.Resolve(request.NodeKey, request.DocumentTypeUnique, out bool isActualContent);

                // The resolved culture is applied as a side effect on ContextCultureService;
                // downstream rendering picks it up from there rather than from a return value.
                await _contentResolver.ResolveCultureAsync(request.Culture, content);

                await _contentResolver.SetupPublishedRequestAsync(
                    isActualContent ? content : null,
                    new Uri(request.HttpContext.Request.GetDisplayUrl()));

                await _requestEnricher.EnrichAsync(
                    request.HttpContext, content, request.BlockEditorAlias, request.ContentElementAlias,
                    request.ContentUdi, request.SettingsUdi, request.BlockIndex);

                string markup = await render(
                    request.BlockData, content!, request.ControllerContext, request.BlockEditorAlias,
                    request.DocumentTypeUnique, request.ContentUdi ?? string.Empty, request.SettingsUdi, request.BlockIndex);

                return await _responseEnricher.EnrichAsync(
                    markup, request.HttpContext, content, request.BlockEditorAlias, request.ContentElementAlias,
                    request.ContentUdi, request.SettingsUdi, request.BlockIndex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, string.Format(Constants.ErrorMessages.LoggerError, request.ContentElementAlias));
                return string.Format(Constants.ErrorMessages.ErrorTemplate,
                    string.Format(Constants.ErrorMessages.RenderError, ex.Message));
            }
        }

        private bool CheckGeneratedModelsExist()
        {
            return _runtimeCache.GetCacheItem(Constants.CacheKeys.GeneratedModels, () =>
            {
                return _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().Any();
            }, CacheDuration);
        }
    }
}
