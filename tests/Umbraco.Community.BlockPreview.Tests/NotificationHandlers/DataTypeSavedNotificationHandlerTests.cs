using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.NotificationHandlers;

namespace Umbraco.Community.BlockPreview.Tests.NotificationHandlers;

[TestFixture]
public class DataTypeSavedNotificationHandlerTests
{
    private Mock<IAppPolicyCache> _mockRuntimeCache = null!;
    private Mock<IContentTypeService> _mockContentTypeService = null!;
    private DataTypeSavedNotificationHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _mockRuntimeCache = new Mock<IAppPolicyCache>();
        _mockContentTypeService = new Mock<IContentTypeService>();
        var appCaches = new AppCaches(
            _mockRuntimeCache.Object,
            Mock.Of<IRequestCache>(),
            new IsolatedCaches(_ => Mock.Of<IAppPolicyCache>()));
        _handler = new DataTypeSavedNotificationHandler(appCaches, _mockContentTypeService.Object);
    }

    [Test]
    public void Handle_WithBlockGridEditor_ClearsDataTypeCache()
    {
        var dataTypeKey = Guid.NewGuid();
        var dataType = CreateMockDataType(dataTypeKey, Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);
        _mockContentTypeService.Setup(s => s.GetAll()).Returns(Enumerable.Empty<IContentType>());
        var notification = new DataTypeSavedNotification(dataType.Object, new EventMessages());

        _handler.Handle(notification);

        var expectedKey = string.Format(Constants.CacheKeys.DataType, dataTypeKey);
        _mockRuntimeCache.Verify(c => c.ClearByKey(expectedKey), Times.Once);
    }

    [Test]
    public void Handle_WithNonBlockEditor_DoesNotClearCache()
    {
        var dataType = CreateMockDataType(Guid.NewGuid(), Cms.Core.Constants.PropertyEditors.Aliases.TextBox);
        var notification = new DataTypeSavedNotification(dataType.Object, new EventMessages());

        _handler.Handle(notification);

        _mockRuntimeCache.Verify(c => c.ClearByKey(It.IsAny<string>()), Times.Never);
    }

    [Test]
    public void Handle_CascadesClearsToDependentContentTypes()
    {
        var dataTypeKey = Guid.NewGuid();
        var contentTypeKey = Guid.NewGuid();
        var dataType = CreateMockDataType(dataTypeKey, Cms.Core.Constants.PropertyEditors.Aliases.BlockList);

        var mockPropertyType = new Mock<IPropertyType>();
        mockPropertyType.Setup(p => p.DataTypeKey).Returns(dataTypeKey);

        var mockContentType = new Mock<IContentType>();
        mockContentType.Setup(ct => ct.Key).Returns(contentTypeKey);
        mockContentType.Setup(ct => ct.PropertyTypes).Returns(new[] { mockPropertyType.Object });
        mockContentType.Setup(ct => ct.CompositionPropertyTypes).Returns(Enumerable.Empty<IPropertyType>());

        _mockContentTypeService.Setup(s => s.GetAll()).Returns(new[] { mockContentType.Object });
        var notification = new DataTypeSavedNotification(dataType.Object, new EventMessages());

        _handler.Handle(notification);

        var expectedKey = string.Format(Constants.CacheKeys.ContentType, contentTypeKey);
        _mockRuntimeCache.Verify(c => c.ClearByKey(expectedKey), Times.Once);
    }

    [Test]
    public void Handle_WithEmptyEntities_DoesNotClearAnyCache()
    {
        var notification = new DataTypeSavedNotification(
            Enumerable.Empty<IDataType>(), new EventMessages());

        _handler.Handle(notification);

        _mockRuntimeCache.Verify(c => c.ClearByKey(It.IsAny<string>()), Times.Never);
    }

    private static Mock<IDataType> CreateMockDataType(Guid key, string editorAlias)
    {
        var mockDataType = new Mock<IDataType>();
        mockDataType.Setup(dt => dt.Key).Returns(key);
        mockDataType.Setup(dt => dt.EditorAlias).Returns(editorAlias);
        return mockDataType;
    }
}
