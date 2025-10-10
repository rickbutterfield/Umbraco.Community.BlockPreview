using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Umbraco.Cms.Api.Common.OpenApi;

namespace Umbraco.Community.BlockPreview.Configuration
{
    public class CustomOperationIdHandler : IOperationIdHandler
    {
        public bool CanHandle(ApiDescription apiDescription)
        {
            if (apiDescription.ActionDescriptor is not
                ControllerActionDescriptor controllerActionDescriptor)
                return false;

            return CanHandle(apiDescription, controllerActionDescriptor);
        }

        public bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
            => controllerActionDescriptor.ControllerTypeInfo.Namespace?.Contains("BlockPreview") is true;

        public string Handle(ApiDescription apiDescription)
            => $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
    }
}
