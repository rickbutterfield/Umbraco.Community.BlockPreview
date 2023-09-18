using System.Web;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Trees;

namespace Umbraco.Community.BlockPreview.NotificationHandlers
{
    public class TreeRenderingNotificationHandler : INotificationHandler<TreeNodesRenderingNotification>
    {
        public void Handle(TreeNodesRenderingNotification notification)
        {
            if (!string.Equals(notification.TreeAlias, "staticFiles", StringComparison.Ordinal)
                || !string.Equals(notification.Id, "-1", StringComparison.Ordinal)) return;

            notification.Nodes.Add(new TreeNode(HttpUtility.HtmlEncode($"{Constants.Configuration.AppPluginsRoot}/views/block-preview.html"), null, null, null)
            {
                HasChildren = false,
                Icon = "icon-document",
                Name = "block-preview.html",
                ParentId = "-1"                
            });
        }
    }
}
