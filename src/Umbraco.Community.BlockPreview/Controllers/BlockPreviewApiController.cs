using HtmlAgilityPack;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Represents the Block Preview API controller.
    /// </summary>
    public class BlockPreviewApiController : UmbracoAuthorizedJsonController
    {
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILogger<BlockPreviewApiController> _logger;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ContextCultureService _contextCultureService;
        private readonly IBlockPreviewService _blockPreviewService;
        private readonly ILocalizationService _localizationService;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly ITypeFinder _typeFinder;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        #region Public
        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        public BlockPreviewApiController(
            IPublishedRouter publishedRouter,
            ILogger<BlockPreviewApiController> logger,
            IUmbracoContextAccessor umbracoContextAccessor,
            ContextCultureService contextCultureSwitcher,
            IBlockPreviewService blockPreviewService,
            ILocalizationService localizationService,
            ITypeFinder typeFinder,
            AppCaches appCaches)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _blockPreviewService = blockPreviewService;
            _localizationService = localizationService;
            _typeFinder = typeFinder;
            _runtimeCache = appCaches.RuntimeCache;
        }

        /// <summary>
        /// Renders a preview for a grid block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The <see cref="Guid"/> that represents the Umbraco node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node content type</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element</param>
        /// <param name="settingsUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <param name="blockIndex">The <see cref="int"/> that represents the index of the block</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewGridBlock(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string? culture = "",
            [FromQuery] Guid documentTypeKey = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                    string? currentCulture = GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderGridBlock(blockData, ControllerContext, blockEditorAlias, documentTypeKey, contentUdi, settingsUdi, blockIndex);
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
        /// <param name="nodeKey">The <see cref="Guid"/> that represents the Umbraco node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node content type</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewListBlock(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeKey = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                    string? currentCulture = GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderListBlock(blockData, ControllerContext, blockEditorAlias, documentTypeKey, contentUdi, settingsUdi, blockIndex);
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

#if NET8_0
        /// <summary>
        /// Renders a preview for a rich text block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The <see cref="Guid"/> that represents the Umbraco node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node content type</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewRichTextMarkup(
            [FromBody] BlockValue blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeKey = default)
        {
            string markup;

            if (CheckGeneratedModelsExist())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeKey);

                    string? currentCulture = GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderRichTextBlock(blockData, ControllerContext);
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
#endif
        #endregion

        #region Private
        private bool CheckGeneratedModelsExist()
        {
            return _runtimeCache.GetCacheItem(Constants.CacheKeys.GeneratedModels, () =>
            {
                return _typeFinder.FindClassesWithAttribute<PublishedModelAttribute>().Any();
            }, CacheDuration);
        }

        private string GetCurrentCulture(string? culture, IPublishedContent? content = null)
        {
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? content?.GetCultureFromDomains()
                : culture;

            if (string.IsNullOrEmpty(currentCulture) || currentCulture == "undefined")
                currentCulture = _localizationService.GetDefaultLanguageIsoCode();

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
            context.ForcedPreview(true);
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

            var publishedContentType = context.Content?.GetContentType(documentTypeUnique.GetValueOrDefault());
            if (publishedContentType == null)
                return null;

            return _runtimeCache.GetCacheItem(contentCacheKey, () =>
            {
                return context.Content?.GetByContentType(publishedContentType).FirstOrDefault();
            }, CacheDuration);
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
