using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Interfaces;
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
        private readonly IPreviewRequestExecutor _requestExecutor;
        private readonly IMarkupSanitizer _markupSanitizer;
        private readonly IPreviewContentResolver _contentResolver;
        private readonly IBlockPreviewService _blockPreviewService;
        private readonly IOptions<BlockPreviewOptions> _blockPreviewSettings;
        private readonly IAppPolicyCache _runtimeCache;
        private readonly IBlockPreviewRequestEnricher _requestEnricher;

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        [ActivatorUtilitiesConstructor]
        public BlockPreviewApiController(
            IPreviewRequestExecutor requestExecutor,
            IMarkupSanitizer markupSanitizer,
            IPreviewContentResolver contentResolver,
            IBlockPreviewService blockPreviewService,
            IOptions<BlockPreviewOptions> blockPreviewSettings,
            AppCaches appCaches,
            IBlockPreviewRequestEnricher requestEnricher)
        {
            _requestExecutor = requestExecutor;
            _markupSanitizer = markupSanitizer;
            _contentResolver = contentResolver;
            _blockPreviewService = blockPreviewService;
            _blockPreviewSettings = blockPreviewSettings;
            _runtimeCache = appCaches.RuntimeCache;
            _requestEnricher = requestEnricher;
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
        public Task<IActionResult> PreviewGridBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string? culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
            => RunPreviewAsync(blockData, nodeKey, blockEditorAlias, contentElementAlias, culture,
                documentTypeUnique, contentUdi, settingsUdi, blockIndex, _blockPreviewService.RenderGridBlock);

        /// <summary>
        /// Renders a preview for a block list block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The key of the node.</param>
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
        public Task<IActionResult> PreviewListBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
            => RunPreviewAsync(blockData, nodeKey, blockEditorAlias, contentElementAlias, culture,
                documentTypeUnique, contentUdi, settingsUdi, blockIndex, _blockPreviewService.RenderListBlock);

        /// <summary>
        /// Renders a preview for a single block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <param name="contentUdi">The <see cref="Cms.Core.Udi"/> that represents the content element</param>
        /// <param name="settingsUdi">The <see cref="Cms.Core.Udi"/> that represents the settings element</param>
        /// <param name="blockIndex">The <see cref="int"/> that represents the block index</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/single")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), 200)]
        public Task<IActionResult> PreviewSingleBlock(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default,
            [FromQuery] string contentUdi = "",
            [FromQuery] string? settingsUdi = default,
            [FromQuery] int? blockIndex = 0)
            => RunPreviewAsync(blockData, nodeKey, blockEditorAlias, contentElementAlias, culture,
                documentTypeUnique, contentUdi, settingsUdi, blockIndex, _blockPreviewService.RenderSingleBlock);

        /// <summary>
        /// Renders a preview for a rich text block using the associated Razor view or ViewComponent.
        /// </summary>
        /// <param name="blockData">The JSON content data of the block.</param>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="blockEditorAlias">The alias of the block editor</param>
        /// <param name="contentElementAlias">The alias of the content being rendered</param>
        /// <param name="culture">The current culture</param>
        /// <param name="documentTypeUnique">The <see cref="Guid"/> that represents the Umbraco node</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost("preview/rte")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(string), 200)]
        public Task<IActionResult> PreviewRichTextMarkup(
            [FromBody] string blockData,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] string blockEditorAlias = "",
            [FromQuery] string contentElementAlias = "",
            [FromQuery] string culture = "",
            [FromQuery] Guid documentTypeUnique = default)
            => RunPreviewAsync(blockData, nodeKey, blockEditorAlias, contentElementAlias, culture,
                documentTypeUnique, contentUdi: null, settingsUdi: null, blockIndex: null,
                (bd, c, cc, _, _, _, _, _) => _blockPreviewService.RenderRichTextBlock(bd, c, cc));

        #endregion

        #region Private

        private async Task<IActionResult> RunPreviewAsync(
            string blockData, Guid nodeKey, string blockEditorAlias, string contentElementAlias,
            string? culture, Guid documentTypeUnique, string? contentUdi, string? settingsUdi, int? blockIndex,
            Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>> render)
        {
            var request = new PreviewRenderRequest(
                blockData, nodeKey, blockEditorAlias, contentElementAlias, culture, documentTypeUnique,
                contentUdi, settingsUdi, blockIndex, HttpContext, ControllerContext);

            string markup = await _requestExecutor.ExecuteAsync(request, render);

            return Ok(_markupSanitizer.CleanUp(markup));
        }

        #endregion

        #region Public

        /// <summary>
        /// Retrieves the stylesheet paths for a single block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>A list of stylesheet paths if configured; otherwise, an empty list.</returns>
        [HttpGet("preview/single/stylesheets")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<string>))]
        public Task<IActionResult> GetSingleBlockStylesheets(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
            => GetStylesheets(BlockType.SingleBlock, nodeKey, documentTypeUnique);

        /// <summary>
        /// Loads the in-memory settings from appsettings.json
        /// </summary>
        /// <returns><see cref="BlockPreviewOptions">Block Preview settings</see></returns>
        [HttpGet("settings")]
        [ProducesResponseType(typeof(BlockPreviewOptions), 200)]
        public BlockPreviewOptions GetSettings()
        {
            var settings = _blockPreviewSettings.Value;

            // If any block type has IgnoredContentTypes configured (and ContentTypes is not set), compute ContentTypes dynamically
            if (ShouldApplyIgnoredContentTypes(settings.BlockGrid) ||
                ShouldApplyIgnoredContentTypes(settings.BlockList) ||
                ShouldApplyIgnoredContentTypes(settings.RichText) ||
                ShouldApplyIgnoredContentTypes(settings.SingleBlock))
            {
                var allElementAliases = _runtimeCache.GetCacheItem(Constants.CacheKeys.ElementAliases, () =>
                {
                    var contentTypeService = HttpContext.RequestServices.GetRequiredService<IContentTypeService>();
                    return contentTypeService.GetAll()
                        .Where(ct => ct.IsElement)
                        .Select(ct => ct.Alias)
                        .ToList();
                }, CacheDuration) ?? [];

                return new BlockPreviewOptions
                {
                    BlockGrid = ApplyIgnoredContentTypes(settings.BlockGrid, allElementAliases),
                    BlockList = ApplyIgnoredContentTypes(settings.BlockList, allElementAliases),
                    RichText = ApplyIgnoredContentTypes(settings.RichText, allElementAliases),
                    SingleBlock = ApplyIgnoredContentTypes(settings.SingleBlock, allElementAliases)
                };
            }

            return settings;
        }

        private static bool ShouldApplyIgnoredContentTypes(BlockTypeSettings? blockTypeSettings) =>
            blockTypeSettings?.IgnoredContentTypes.Count > 0 &&
            (blockTypeSettings.ContentTypes == null || blockTypeSettings.ContentTypes.Count == 0);

        private static BlockTypeSettings ApplyIgnoredContentTypes(BlockTypeSettings original, List<string> allElementAliases)
        {
            // Only apply if ContentTypes is not explicitly set
            if (original.ContentTypes?.Count > 0 || original.IgnoredContentTypes.Count == 0)
            {
                return original;
            }

            return new BlockTypeSettings
            {
                Enabled = original.Enabled,
                ViewLocations = original.ViewLocations,
                ContentTypes = allElementAliases
                    .Except(original.IgnoredContentTypes, StringComparer.OrdinalIgnoreCase)
                    .ToList(),
                IgnoredContentTypes = original.IgnoredContentTypes,
#pragma warning disable CS0618 // Type or member is obsolete
                Stylesheet = original.Stylesheet,
#pragma warning restore CS0618 // Type or member is obsolete
                Stylesheets = original.Stylesheets
            };
        }


        /// <summary>
        /// Retrieves the stylesheet paths for a block preview of the given type.
        /// </summary>
        /// <param name="blockType">The block editor type.</param>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>A list of stylesheet paths if configured; otherwise, an empty list.</returns>
        [HttpGet("preview/stylesheets")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<string>))]
        public async Task<IActionResult> GetStylesheets(
            [FromQuery] BlockType blockType,
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
        {
            IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

            await _requestEnricher.EnrichAsync(HttpContext, content);

            var stylesheetPaths = await _blockPreviewService.GetStylesheetPaths(blockType, content!, ControllerContext);

            return Ok(stylesheetPaths);
        }

        /// <summary>
        /// Retrieves the stylesheet path for a grid block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>The stylesheet path if configured; otherwise, a 404 response.</returns>
        [Obsolete("Use GetGridStylesheets instead to support multiple stylesheets.")]
        [HttpGet("preview/grid/stylesheet")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> GetGridStylesheet(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
        {
            IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

            await _requestEnricher.EnrichAsync(HttpContext, content);

#pragma warning disable CS0618 // Type or member is obsolete
            String? stylesheetPath = await _blockPreviewService.GetStylesheetPath(BlockType.BlockGrid, content!, ControllerContext);
#pragma warning restore CS0618 // Type or member is obsolete

            if (string.IsNullOrWhiteSpace(stylesheetPath))
            {
                return Ok(string.Empty);
            }
            return Ok(stylesheetPath);
        }

        /// <summary>
        /// Retrieves the stylesheet paths for a grid block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>A list of stylesheet paths if configured; otherwise, a 404 response.</returns>
        [HttpGet("preview/grid/stylesheets")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<string>))]
        public Task<IActionResult> GetGridStylesheets(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
            => GetStylesheets(BlockType.BlockGrid, nodeKey, documentTypeUnique);

        /// <summary>
        /// Retrieves the stylesheet path for a list block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>The stylesheet path if configured; otherwise, a 404 response.</returns>
        [Obsolete("Use GetListStylesheets instead to support multiple stylesheets.")]
        [HttpGet("preview/list/stylesheet")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> GetListStylesheet(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
        {
            IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

            await _requestEnricher.EnrichAsync(HttpContext, content);

#pragma warning disable CS0618 // Type or member is obsolete
            String? stylesheetPath = await _blockPreviewService.GetStylesheetPath(BlockType.BlockList, content!, ControllerContext);
#pragma warning restore CS0618 // Type or member is obsolete

            if (string.IsNullOrWhiteSpace(stylesheetPath))
            {
                return Ok(string.Empty);
            }
            return Ok(stylesheetPath);
        }

        /// <summary>
        /// Retrieves the stylesheet paths for a list block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>A list of stylesheet paths if configured; otherwise, a 404 response.</returns>
        [HttpGet("preview/list/stylesheets")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<string>))]
        public Task<IActionResult> GetListStylesheets(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
            => GetStylesheets(BlockType.BlockList, nodeKey, documentTypeUnique);

        /// <summary>
        /// Retrieves the stylesheet path for a rich text block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>The stylesheet path if configured; otherwise, a 404 response.</returns>
        [Obsolete("Use GetRteStylesheets instead to support multiple stylesheets.")]
        [HttpGet("preview/rte/stylesheet")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> GetRteStylesheet(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
        {
            IPublishedContent? content = GetPublishedContent(nodeKey, documentTypeUnique);

            await _requestEnricher.EnrichAsync(HttpContext, content);

#pragma warning disable CS0618 // Type or member is obsolete
            String? stylesheetPath = await _blockPreviewService.GetStylesheetPath(BlockType.RichText, content!, ControllerContext);
#pragma warning restore CS0618 // Type or member is obsolete

            if (string.IsNullOrWhiteSpace(stylesheetPath))
            {
                return Ok(string.Empty);
            }
            return Ok(stylesheetPath);
        }

        /// <summary>
        /// Retrieves the stylesheet paths for a rich text block preview.
        /// </summary>
        /// <param name="nodeKey">The key of the node.</param>
        /// <param name="documentTypeUnique">The unique identifier for the document type.</param>
        /// <returns>A list of stylesheet paths if configured; otherwise, a 404 response.</returns>
        [HttpGet("preview/rte/stylesheets")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<string>))]
        public Task<IActionResult> GetRteStylesheets(
            [FromQuery] Guid nodeKey = default,
            [FromQuery] Guid documentTypeUnique = default)
            => GetStylesheets(BlockType.RichText, nodeKey, documentTypeUnique);
        #endregion

        #region Private

        private IPublishedContent? GetPublishedContent(Guid? nodeKey = default, Guid? documentTypeUnique = default)
            => _contentResolver.Resolve(nodeKey, documentTypeUnique, out _);

        #endregion
    }
}