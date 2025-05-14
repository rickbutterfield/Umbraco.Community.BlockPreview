using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.NotificationHandlers
{
    public class ContentTypeSavedNotificationHandler : INotificationHandler<ContentTypeSavedNotification>
    {
        private readonly IAppPolicyCache _runtimeCache;

        public ContentTypeSavedNotificationHandler(AppCaches appCaches)
            => _runtimeCache = appCaches.RuntimeCache;

        public void Handle(ContentTypeSavedNotification notification)
        {
            if (notification.SavedEntities == null || notification.SavedEntities.Count() == 0)
                return;

            IContentType? savedContentType = notification.SavedEntities.FirstOrDefault();
            if (savedContentType != null)
            {
                bool matchingEditor = savedContentType.PropertyTypes.Any(x => x.PropertyEditorAlias.ContainsAny(new[] {
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                    Cms.Core.Constants.PropertyEditors.Aliases.TinyMce
                }));

                if (matchingEditor)
                    _runtimeCache.ClearByKey(string.Format(Constants.CacheKeys.ContentType, savedContentType.Key));
            }
        }
    }
}
