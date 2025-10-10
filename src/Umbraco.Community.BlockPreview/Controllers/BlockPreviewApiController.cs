using Asp.Versioning;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.HybridCache;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Represents the Block Preview API controller.
    /// </summary>
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "BlockPreview")]
    public class BlockPreviewApiController : BlockPreviewApiControllerBase
    {
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILogger<BlockPreviewApiController> _logger;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ContextCultureService _contextCultureService;
        private readonly IBlockPreviewService _blockPreviewService;
        private readonly ILanguageService _languageService;
        private readonly IOptions<BlockPreviewOptions> _blockPreviewSettings;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly ITypeFinder _typeFinder;
        private readonly IDocumentCacheService _documentCacheService;
        private readonly IPublishedContentTypeCache _contentTypeCache;
        private readonly IScopeProvider _scopeProvider;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        public BlockPreviewApiController(
            IPublishedRouter publishedRouter,
            ILogger<BlockPreviewApiController> logger,
            IUmbracoContextAccessor umbracoContextAccessor,
            ContextCultureService contextCultureSwitcher,
            IBlockPreviewService blockPreviewService,
            ILanguageService languageService,
            IOptions<BlockPreviewOptions> blockPreviewSettings,
            ITypeFinder typeFinder,
            AppCaches appCaches,
            IElementsCache elementsCache,
            IDocumentCacheService documentCacheService,
            IPublishedContentTypeCache contentTypeCache,
            IScopeProvider scopeProvider)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _blockPreviewService = blockPreviewService;
            _languageService = languageService;
            _blockPreviewSettings = blockPreviewSettings;
            _typeFinder = typeFinder;
            _runtimeCache = appCaches.RuntimeCache;
            _documentCacheService = documentCacheService;
            _contentTypeCache = contentTypeCache;
            _scopeProvider = scopeProvider;
        }

        #region Public
        /// <summary>
        /// Renders a preview for a grid block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The <see cref="Guid"/> that represents the Umbraco node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element</param>
        /// <param name="settingsUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <param name="blockIndex">The <see cref="int"/> that represents the block index</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/grid")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewGridBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string? culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderGridBlock(blockData, content!, ControllerContext, blockEditorAlias, documentTypeUnique, contentUdi, settingsUdi, blockIndex);
                }
                catch (Exception ex)
                {
                    markup = string.Format(Constants.ErrorMessages.ErrorTemplate, string.Format(Constants.ErrorMessages.RenderError, ex.Message));
                    _logger.LogError(ex, string.Format(Constants.ErrorMessages.LoggerError, contentElementAlias));
                }
            }

            else
            {
                markup = string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.ModelsBuilderError);
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Renders a preview for a list block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element</param>
        /// <param name="settingsUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <param name="blockIndex">The <see cref="int"/> that represents the block index</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/list")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewListBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderListBlock(blockData, content!, ControllerContext, blockEditorAlias, documentTypeUnique, contentUdi, settingsUdi, blockIndex);
                }
                catch (Exception ex)
                {
                    markup = string.Format(Constants.ErrorMessages.ErrorTemplate, string.Format(Constants.ErrorMessages.RenderError, ex.Message));
                    _logger.LogError(ex, string.Format(Constants.ErrorMessages.LoggerError, contentElementAlias));
                }
            }

            else
            {
                markup = string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.ModelsBuilderError);
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Renders a preview for a rich text block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/rte")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewRichTextMarkup(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderRichTextBlock(blockData, content!, ControllerContext, blockEditorAlias, documentTypeUnique);
                }
                catch (Exception ex)
                {
                    markup = string.Format(Constants.ErrorMessages.ErrorTemplate, string.Format(Constants.ErrorMessages.RenderError, ex.Message));
                    _logger.LogError(ex, string.Format(Constants.ErrorMessages.LoggerError, contentElementAlias));
                }
            }

            else
            {
                markup = string.Format(Constants.ErrorMessages.WarningTemplate, Constants.ErrorMessages.ModelsBuilderError);
            }

            string? cleanMarkup = CleanUpMarkup(markup);
            return Ok(cleanMarkup);
        }

        /// <summary>
        /// Loads the in-memory settings from appsettings.json
        /// </summary>
        /// <returns><see cref="BlockPreviewOptions">Block Preview settings</see></returns>
        [AllowAnonymous]
        [HttpGet("settings")]
        [ProducesResponseType(typeof(BlockPreviewOptions), 200)]
        public BlockPreviewOptions GetSettings() =>
            _blockPreviewSettings.Value;

        #endregion

        #region Private
        private bool CheckGeneratedModelsExist()
        {
            return _runtimeCache.GetCacheItem(Constants.CacheKeys.GeneratedModels, () =>
            {
                return _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().Any();
            }, CacheDuration);
        }

        private async Task<string?> GetCurrentCulture(string? culture, IPublishedContent? content = null)
        {
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? content?.GetCultureFromDomains()
                : culture;

            if (string.IsNullOrEmpty(currentCulture) || culture == "undefined")
                currentCulture = await _languageService.GetDefaultIsoCodeAsync();

            _contextCultureService.SetCulture(currentCulture);

            return currentCulture;
        }

        private async Task SetupPublishedRequest(string? culture, IPublishedContent? content = null)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return;

            var requestUrl = new Uri(Request.GetDisplayUrl());
            var requestBuilder = await _publishedRouter.CreateRequestAsync(requestUrl);

            if (content != null)
                requestBuilder.SetPublishedContent(content);

            context.PublishedRequest = requestBuilder.Build();
        }

        private IPublishedContent? GetPublishedContent(Guid? nodeKey = default, Guid? documentTypeUnique = default)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            IPublishedContent? content = null;

            var contentCacheKey = string.Format(Constants.CacheKeys.Content, nodeKey);
            if (nodeKey != default)
            {
                content = _runtimeCache.GetCacheItem(contentCacheKey, () =>
                {
                    return context.Content?.GetById(true, nodeKey.GetValueOrDefault());
                }, CacheDuration);
            }

            if (content != null)
                return content;

            var publishedContentType = _contentTypeCache.Get(PublishedItemType.Content, documentTypeUnique.GetValueOrDefault());

            if (publishedContentType == null)
                return null;

            using var scope = _scopeProvider.CreateScope();
            var cacheItem = _runtimeCache.GetCacheItem(contentCacheKey, () =>
            {
                return _documentCacheService.GetByContentType(publishedContentType).FirstOrDefault();
            }, CacheDuration);
            scope.Complete();
            return cacheItem;
        }

        private static string CleanUpMarkup(string markup)
        {
            if (string.IsNullOrWhiteSpace(markup))
                return markup;

            var content = new HtmlDocument();
            content.LoadHtml(markup);

            // make sure links are not clickable in the back office, because this will prevent editing
            var links = content.DocumentNode.SelectNodes("//a");

            if (links != null)
            {
                foreach (var link in links)
                {
                    link.SetAttributeValue("href", "javascript:;");
                    link.SetAttributeValue("data-block-preview-link", "true");
                }
            }

            // disable forms so they can't be submitted via tab
            var formElements = content.DocumentNode.SelectNodes("//input | //textarea | //select | //button");
            if (formElements != null)
            {
                foreach (var formElement in formElements)
                {
                    formElement.SetAttributeValue("disabled", "disabled");
                }
            }

            return content.DocumentNode.OuterHtml;
        }
        #endregion
    }
}