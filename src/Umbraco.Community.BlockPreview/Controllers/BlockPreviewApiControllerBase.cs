using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core.Features;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Umbraco.Community.BlockPreview.Controllers
{
    [ApiController]
    [BackOfficeRoute("blockpreview/api/v{version:apiVersion}")]
    [Authorize(Policy = "New" + AuthorizationPolicies.BackOfficeAccess)]
    [MapToApi("blockpreview")]
    public class BlockPreviewApiControllerBase : Controller, IUmbracoFeature
    {
    }
}
