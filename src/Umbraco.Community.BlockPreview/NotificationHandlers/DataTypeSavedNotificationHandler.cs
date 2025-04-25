using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace Umbraco.Community.BlockPreview.NotificationHandlers
{
    public class DataTypeSavedNotificationHandler : INotificationHandler<DataTypeSavedNotification>
    {
        private readonly IAppPolicyCache _runtimeCache;

        public DataTypeSavedNotificationHandler(AppCaches appCaches)
            => _runtimeCache = appCaches.RuntimeCache;

        public void Handle(DataTypeSavedNotification notification)
        {
            if (notification.SavedEntities == null || notification.SavedEntities.Count() == 0)
                return;

            IDataType? savedDataType = notification.SavedEntities.FirstOrDefault();
            if (savedDataType != null)
            {
                bool matchingEditor = savedDataType.EditorAlias.ContainsAny(new[] {
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                    Cms.Core.Constants.PropertyEditors.Aliases.RichText
                });

                if (matchingEditor)
                    _runtimeCache.ClearByKey(string.Format(Constants.CacheKeys.DataType, savedDataType.Key));
            }
        }
    }
}
