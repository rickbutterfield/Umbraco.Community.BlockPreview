using System;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.BackOffice.Controllers;
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
        private readonly IVariationContextAccessor _variationContextAccessor;
        private readonly IBackOfficePreviewService _backOfficePreviewService;
        private readonly ISiteDomainMapper _siteDomainMapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewApiController"/> class.
        /// </summary>
        public BlockPreviewApiController(
            IPublishedRouter publishedRouter,
            ILogger<BlockPreviewApiController> logger,
            IUmbracoContextAccessor umbracoContextAccessor,
            IVariationContextAccessor variationContextAccessor,
            IBackOfficePreviewService backOfficePreviewService,
            ISiteDomainMapper siteDomainMapper)
        {
            _publishedRouter = publishedRouter;
            _logger = logger;
            _umbracoContextAccessor = umbracoContextAccessor;
            _variationContextAccessor = variationContextAccessor;
            _backOfficePreviewService = backOfficePreviewService;
            _siteDomainMapper = siteDomainMapper;
        }

        /// <summary>
        /// Renders a preview for a block using the associated razor view.
        /// </summary>
        /// <param name="content">The JSON content data of the block.</param>
        /// <param name="settings">The JSON settings data of the block.</param>
        /// <param name="pageId">The current page id.</param>
        /// <param name="culture">The culture</param>
        /// <returns>The markup to render in the preview.</returns>
        [HttpPost]
        public async Task<IActionResult> PreviewMarkup(
            [FromBody] BlockData data,
            [FromQuery] int pageId = 0,
            [FromQuery] bool isGrid = false,
            [FromQuery] string culture = "")
        {
            string markup;

            try
            {
                IPublishedContent page = null;

                // If the page is new, then the ID will be zero
                if (pageId > 0)
                {
                    page = GetPublishedContentForPage(pageId);
                }

                if (page == null)
                {
                    return Ok("The page is not saved yet, so we can't create a preview. Save the page first.");
                }

                await SetupPublishedRequest(culture, page);

                markup = await _backOfficePreviewService.GetMarkupForBlock(data.Content, data.Settings, isGrid, ControllerContext);
            }
            catch (Exception ex)
            {
                markup = "Something went wrong rendering a preview.";
                _logger.LogError(ex, "Error rendering preview for block {ContentTypeAlias}", data.Content.ContentTypeAlias);
            }

            return Ok(CleanUpMarkup(markup));
        }

        private async Task SetupPublishedRequest(string culture, IPublishedContent page)
        {
            // set the published request for the page we are editing in the back office
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext context))
            {
                return;
            }

            // set the published request
            var requestBuilder = await _publishedRouter.CreateRequestAsync(new Uri(Request.GetDisplayUrl()));
            requestBuilder.SetPublishedContent(page);
            context.PublishedRequest = requestBuilder.Build();
            context.ForcedPreview(true);

            // if in a culture variant setup also set the correct language.
            var currentCulture = string.IsNullOrWhiteSpace(culture)
                ? page.GetCultureFromDomains(_umbracoContextAccessor, _siteDomainMapper)
                : culture;

            if (currentCulture == null || !page.Cultures.ContainsKey(currentCulture))
            {
                return;
            }

            var cultureInfo = new CultureInfo(page.Cultures[currentCulture].Culture);

            Thread.CurrentThread.CurrentCulture = cultureInfo;
            Thread.CurrentThread.CurrentUICulture = cultureInfo;
            _variationContextAccessor.VariationContext = new VariationContext(cultureInfo.Name);
        }

        private IPublishedContent GetPublishedContentForPage(int pageId)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out IUmbracoContext context))
            {
                return null;
            }

            // Get page from published cache.
            // If unpublished, then get it from preview
            return context.Content?.GetById(pageId) ?? context.Content?.GetById(true, pageId);
        }

        private string CleanUpMarkup(string markup)
        {
            if (string.IsNullOrWhiteSpace(markup))
            {
                return markup;
            }

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
