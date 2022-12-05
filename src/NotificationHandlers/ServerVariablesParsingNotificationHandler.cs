using Microsoft.AspNetCore.Routing;
using Our.Umbraco.BlockGridPreview.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace Our.Umbraco.BlockPreview.NotificationHandlers
{
    internal class ServerVariablesParsingNotificationHandler : INotificationHandler<ServerVariablesParsingNotification>
    {
        private readonly LinkGenerator _linkGenerator;

        public ServerVariablesParsingNotificationHandler(LinkGenerator linkGenerator)
        {
            _linkGenerator = linkGenerator;
        }

        public void Handle(ServerVariablesParsingNotification notification)
        {
            notification.ServerVariables.Add("OurUmbracoBlockPreview", new
            {
                PreviewApi = _linkGenerator.GetPathByAction(nameof(BlockPreviewApiController.PreviewMarkup),
                ControllerExtensions.GetControllerName<BlockPreviewApiController>())
            });
        }
    }
}
