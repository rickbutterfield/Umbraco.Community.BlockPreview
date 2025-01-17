using Asp.Versioning;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Represents the Block Preview API controller.
    /// </summary>
    [ApiVersion("1.0")]
    [VersionedApiBackOfficeRoute("block-preview")]
    public class BlockPreviewApiController : BlockPreviewApiControllerBase
    {
        private readonly IPublishedRouter _publishedRouter;
        private readonly ILogger<BlockPreviewApiController> _logger;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ContextCultureService _contextCultureService;
        private readonly IBlockPreviewService _blockPreviewService;
        private readonly ILanguageService _languageService;
        private readonly ISiteDomainMapper _siteDomainMapper;
        private readonly BlockPreviewOptions _blockPreviewSettings;
        private readonly ModelsBuilderSettings _modelsBuilderSettings;

        private const string RENDER_ERROR = "<div class=\"preview-alert preview-alert-error\"><strong>Something went wrong rendering a preview.</strong><br/><pre>{0}</pre></div>";
        private const string MODELS_BUILDER_ERROR = "<div class=\"preview-alert preview-alert-error\"><strong><code>Umbraco:Cms:ModelsBuilder:ModelsBuilderMode</code></strong> must be set to either <strong><code>SourceCodeManual</code></strong> or <strong><code>SourceCodeAuto</code></strong> for BlockPreview to work.</div>";
        private const string LOGGER_ERROR = "Error rendering preview for block {0}";

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
            ISiteDomainMapper siteDomainMapper,
            IOptionsMonitor<BlockPreviewOptions> blockPreviewSettings,
            IOptionsMonitor<ModelsBuilderSettings> modelsBuilderSettings)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _contextCultureService = contextCultureSwitcher;
            _blockPreviewService = blockPreviewService;
            _languageService = languageService;
            _siteDomainMapper = siteDomainMapper;
            _blockPreviewSettings = blockPreviewSettings.CurrentValue;
            _modelsBuilderSettings = modelsBuilderSettings.CurrentValue;
        }

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
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/grid")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewGridBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string? culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default)
        {
            string markup;

            if (_modelsBuilderSettings.ModelsMode.SupportsExplicitGeneration())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderGridBlock(blockData, ControllerContext, blockEditorAlias, documentTypeUnique, contentUdi, settingsUdi);
                }
                catch (Exception ex)
                {
                    markup = string.Format(RENDER_ERROR, ex.Message);
                    _logger.LogError(ex, string.Format(LOGGER_ERROR, contentElementAlias));
                }
            }

            else
            {
                markup = MODELS_BUILDER_ERROR;
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
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/list")]
        [ProducesResponseType(typeof(string), 200)]
        public async Task<IActionResult> PreviewListBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default)
        {
            string markup;

            if (_modelsBuilderSettings.ModelsMode.SupportsExplicitGeneration())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderListBlock(blockData, ControllerContext);
                }
                catch (Exception ex)
                {
                    markup = string.Format(RENDER_ERROR, ex.Message);
                    _logger.LogError(ex, string.Format(LOGGER_ERROR, contentElementAlias));
                }
            }

            else
            {
                markup = MODELS_BUILDER_ERROR;
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

            if (_modelsBuilderSettings.ModelsMode.SupportsExplicitGeneration())
            {
                try
                {
                    IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

                    string? currentCulture = await GetCurrentCulture(culture, content);

                    await SetupPublishedRequest(currentCulture, content);

                    markup = await _blockPreviewService.RenderRichTextBlock(blockData, ControllerContext);
                }
                catch (Exception ex)
                {
                    markup = string.Format(RENDER_ERROR, ex.Message);
                    _logger.LogError(ex, string.Format(LOGGER_ERROR, contentElementAlias));
                }
            }

            else
            {
                markup = MODELS_BUILDER_ERROR;
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
        public BlockPreviewOptions GetSettings()
        {
            return _blockPreviewSettings;
        }

        private async Task<string?> GetCurrentCulture(string? culture, IPublishedContent? content = null)
        {
            // if in a culture variant setup also set the correct language.
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? content?.GetCultureFromDomains(_umbracoContextAccessor, _siteDomainMapper)
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
            context.ForcedPreview(true);
        }

        private IPublishedContent? GetPublishedContent(Guid? nodeKey = default, Guid? documentTypeUnique = default)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext? context))
                return null;

            IPublishedContent? content = null;

            if (nodeKey != default)
                content = context.Content?.GetById(true, nodeKey.GetValueOrDefault());

            if (content == null)
            {
                var contentType = context.Content?.GetContentType(documentTypeUnique.GetValueOrDefault());
                if (contentType != null)
                {
                    var cache = context.Content?.GetByContentType(contentType);
                    return cache?.FirstOrDefault();
                }
            }

            return content;
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
    }
}
