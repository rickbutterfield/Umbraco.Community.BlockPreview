using Microsoft.AspNetCore.Routing;
using Umbraco.Community.BlockPreview.Controllers;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.NotificationHandlers
{
    internal class ServerVariablesParsingNotificationHandler : INotificationHandler<ServerVariablesParsingNotification>
    {
        private readonly LinkGenerator _linkGenerator;

        public ServerVariablesParsingNotificationHandler(LinkGenerator linkGenerator)
            => _linkGenerator = linkGenerator;

        public void Handle(ServerVariablesParsingNotification notification)
        {
            notification.ServerVariables.Add("UmbracoCommunityBlockPreview", new
            {
                PreviewGridApi = _linkGenerator.GetPathByAction(nameof(BlockPreviewApiController.PreviewGridBlock), ControllerExtensions.GetControllerName<BlockPreviewApiController>()),
                PreviewListApi = _linkGenerator.GetPathByAction(nameof(BlockPreviewApiController.PreviewListBlock), ControllerExtensions.GetControllerName<BlockPreviewApiController>()),
                PreviewRichTextApi = _linkGenerator.GetPathByAction(nameof(BlockPreviewApiController.PreviewRichTextMarkup), ControllerExtensions.GetControllerName<BlockPreviewApiController>())
            });
        }
    }
}
