using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.NotificationHandlers;

namespace Umbraco.Community.BlockPreview.Tests.NotificationHandlers;

[TestFixture]
public class ContentTypeSavedNotificationHandlerTests
{
    private Mock<IAppPolicyCache> _mockRuntimeCache = null!;
    private Mock<IBlockPreviewViewResolver> _mockViewResolver = null!;
    private ContentTypeSavedNotificationHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _mockRuntimeCache = new Mock<IAppPolicyCache>();
        _mockViewResolver = new Mock<IBlockPreviewViewResolver>();
        var appCaches = new AppCaches(
            _mockRuntimeCache.Object,
            Mock.Of<IRequestCache>(),
            new IsolatedCaches(_ => Mock.Of<IAppPolicyCache>()));
        _handler = new ContentTypeSavedNotificationHandler(appCaches, _mockViewResolver.Object);
    }

    [Test]
    public void Handle_ClearsElementAliasesCache()
    {
        var contentType = CreateMockContentType();
        var notification = new ContentTypeSavedNotification(contentType.Object, new EventMessages());

        _handler.Handle(notification);

        _mockRuntimeCache.Verify(c => c.ClearByKey(Constants.CacheKeys.ElementAliases), Times.Once);
    }

    [Test]
    public void Handle_WithBlockEditorProperty_ClearsContentTypeCache()
    {
        var contentTypeKey = Guid.NewGuid();
        var contentType = CreateMockContentType(
            key: contentTypeKey,
            editorAlias: Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);
        var notification = new ContentTypeSavedNotification(contentType.Object, new EventMessages());

        _handler.Handle(notification);

        var expectedKey = string.Format(Constants.CacheKeys.ContentType, contentTypeKey);
        _mockRuntimeCache.Verify(c => c.ClearByKey(expectedKey), Times.Once);
    }

    [Test]
    public void Handle_WithNonBlockEditorProperty_DoesNotClearContentTypeCache()
    {
        var contentTypeKey = Guid.NewGuid();
        var contentType = CreateMockContentType(
            key: contentTypeKey,
            editorAlias: Cms.Core.Constants.PropertyEditors.Aliases.TextBox);
        var notification = new ContentTypeSavedNotification(contentType.Object, new EventMessages());

        _handler.Handle(notification);

        var expectedKey = string.Format(Constants.CacheKeys.ContentType, contentTypeKey);
        _mockRuntimeCache.Verify(c => c.ClearByKey(expectedKey), Times.Never);
    }

    [Test]
    public void Handle_WithElementType_ClearsViewCacheForAlias()
    {
        var contentType = CreateMockContentType(isElement: true, alias: "myElement");
        var notification = new ContentTypeSavedNotification(contentType.Object, new EventMessages());

        _handler.Handle(notification);

        _mockViewResolver.Verify(v => v.ClearCacheForAlias("myElement"), Times.Once);
    }

    [Test]
    public void Handle_WithNonElementType_DoesNotClearViewCache()
    {
        var contentType = CreateMockContentType(isElement: false, alias: "myDocument");
        var notification = new ContentTypeSavedNotification(contentType.Object, new EventMessages());

        _handler.Handle(notification);

        _mockViewResolver.Verify(v => v.ClearCacheForAlias(It.IsAny<string>()), Times.Never);
    }

    [Test]
    public void Handle_WithEmptyEntities_DoesNotClearAnyCache()
    {
        var notification = new ContentTypeSavedNotification(
            Enumerable.Empty<IContentType>(), new EventMessages());

        _handler.Handle(notification);

        _mockRuntimeCache.Verify(c => c.ClearByKey(It.IsAny<string>()), Times.Never);
        _mockViewResolver.Verify(v => v.ClearCacheForAlias(It.IsAny<string>()), Times.Never);
    }

    private static Mock<IContentType> CreateMockContentType(
        Guid? key = null,
        string editorAlias = "Umbraco.TextBox",
        bool isElement = false,
        string alias = "testAlias")
    {
        var mockPropertyType = new Mock<IPropertyType>();
        mockPropertyType.Setup(p => p.PropertyEditorAlias).Returns(editorAlias);

        var mockContentType = new Mock<IContentType>();
        mockContentType.Setup(ct => ct.Key).Returns(key ?? Guid.NewGuid());
        mockContentType.Setup(ct => ct.PropertyTypes).Returns(new[] { mockPropertyType.Object });
        mockContentType.Setup(ct => ct.IsElement).Returns(isElement);
        mockContentType.Setup(ct => ct.Alias).Returns(alias);

        return mockContentType;
    }
}
