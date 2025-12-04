using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Umbraco.Cms.Api.Common.OpenApi;

namespace Umbraco.Community.BlockPreview.Configuration
{
    /// <summary>
    /// Custom operation ID handler for Block Preview API operations.
    /// </summary>
    public class CustomOperationIdHandler : IOperationIdHandler
    {
        /// <summary>
        /// Determines whether this handler can handle the specified API description.
        /// </summary>
        /// <param name="apiDescription">The API description.</param>
        /// <returns>True if this handler can handle the API description; otherwise, false.</returns>
        public bool CanHandle(ApiDescription apiDescription)
        {
            if (apiDescription.ActionDescriptor is not
                ControllerActionDescriptor controllerActionDescriptor)
                return false;

            return CanHandle(apiDescription, controllerActionDescriptor);
        }

        /// <summary>
        /// Determines whether this handler can handle the specified API description with controller action descriptor.
        /// </summary>
        /// <param name="apiDescription">The API description.</param>
        /// <param name="controllerActionDescriptor">The controller action descriptor.</param>
        /// <returns>True if this handler can handle the API description; otherwise, false.</returns>
        public bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
            => controllerActionDescriptor.ControllerTypeInfo.Namespace?.Contains("BlockPreview") is true;

        /// <summary>
        /// Handles the API description and returns the operation ID.
        /// </summary>
        /// <param name="apiDescription">The API description.</param>
        /// <returns>The operation ID.</returns>
        public string Handle(ApiDescription apiDescription)
            => $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
    }
}
