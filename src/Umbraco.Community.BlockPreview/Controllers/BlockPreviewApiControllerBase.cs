using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Community.BlockPreview.Attributes;

namespace Umbraco.Community.BlockPreview.Controllers
{
    /// <summary>
    /// Base controller for Block Preview API endpoints.
    /// </summary>
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [BlockPreviewVersionedRoute("")]
    [MapToApi(Constants.Configuration.ApiName)]
    public class BlockPreviewApiControllerBase : ManagementApiControllerBase { }
}
