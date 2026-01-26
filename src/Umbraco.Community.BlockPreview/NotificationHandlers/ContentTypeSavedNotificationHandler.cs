using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.NotificationHandlers
{
    /// <summary>
    /// Handles content type saved notifications to clear related caches.
    /// </summary>
    public class ContentTypeSavedNotificationHandler : INotificationHandler<ContentTypeSavedNotification>
    {
        private readonly IAppPolicyCache _runtimeCache;

        /// <summary>
        /// Initializes a new instance of the <see cref="ContentTypeSavedNotificationHandler"/> class.
        /// </summary>
        /// <param name="appCaches">The application caches.</param>
        public ContentTypeSavedNotificationHandler(AppCaches appCaches)
            => _runtimeCache = appCaches.RuntimeCache;

        /// <summary>
        /// Handles the content type saved notification.
        /// </summary>
        /// <param name="notification">The notification.</param>
        public void Handle(ContentTypeSavedNotification notification)
        {
            if (notification.SavedEntities == null || !notification.SavedEntities.Any())
                return;

            foreach (var savedContentType in notification.SavedEntities)
            {
                bool matchingEditor = savedContentType.PropertyTypes.Any(x => x.PropertyEditorAlias.ContainsAny(new[] {
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                    Cms.Core.Constants.PropertyEditors.Aliases.RichText
                }));

                if (matchingEditor)
                    _runtimeCache.ClearByKey(string.Format(Constants.CacheKeys.ContentType, savedContentType.Key));
            }
        }
    }
}
