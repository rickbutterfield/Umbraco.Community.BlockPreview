using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Tests.Services;

[TestFixture]
public class BlockModelFactoryTests
{
    private Mock<IPublishedValueFallback> _publishedValueFallbackMock = null!;
    private BlockModelFactory _factory = null!;

    [SetUp]
    public void SetUp()
    {
        _publishedValueFallbackMock = new Mock<IPublishedValueFallback>();
        _factory = new BlockModelFactory(_publishedValueFallbackMock.Object);
    }

    #region CreateModel Tests

    [Test]
    public void CreateModel_WithValidType_ReturnsInstance()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");

        // Act
        var result = _factory.CreateModel(typeof(TestContentModel), elementMock.Object);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<TestContentModel>());
    }

    [Test]
    public void CreateModel_PassesElementAndFallback()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");

        // Act
        var result = _factory.CreateModel(typeof(TestContentModel), elementMock.Object) as TestContentModel;

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Element, Is.SameAs(elementMock.Object));
        Assert.That(result.Fallback, Is.SameAs(_publishedValueFallbackMock.Object));
    }

    [Test]
    public void CreateModel_CachesConstructorLookup()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");

        // Act - call twice with same type
        var result1 = _factory.CreateModel(typeof(TestContentModel), elementMock.Object);
        var result2 = _factory.CreateModel(typeof(TestContentModel), elementMock.Object);

        // Assert - both should succeed (constructor was cached)
        Assert.That(result1, Is.Not.Null);
        Assert.That(result2, Is.Not.Null);
    }

    [Test]
    public void CreateModel_WithInvalidType_ThrowsInvalidOperationException()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() =>
            _factory.CreateModel(typeof(InvalidModel), elementMock.Object));
    }

    #endregion

    #region CreateBlockInstance Tests

    [Test]
    public void CreateBlockInstance_WithNullContentType_ReturnsNull()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockList,
            contentType: null,
            contentElement: elementMock.Object,
            settingsType: null,
            settingsElement: null,
            contentKey: Guid.NewGuid(),
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Null);
    }

    [Test]
    public void CreateBlockInstance_WithNullContentElement_ReturnsNull()
    {
        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockList,
            contentType: typeof(TestContentModel),
            contentElement: null,
            settingsType: null,
            settingsElement: null,
            contentKey: Guid.NewGuid(),
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Null);
    }

    [Test]
    public void CreateBlockInstance_BlockList_WithContentOnly_ReturnsBlockListItem()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");
        var contentKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockList,
            contentType: typeof(TestContentModel),
            contentElement: elementMock.Object,
            settingsType: null,
            settingsElement: null,
            contentKey: contentKey,
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<BlockListItem<TestContentModel>>());

        var blockItem = result as BlockListItem<TestContentModel>;
        Assert.That(blockItem!.Content, Is.Not.Null);
        Assert.That(blockItem.Settings, Is.Null);
    }

    [Test]
    public void CreateBlockInstance_BlockList_WithContentAndSettings_ReturnsBlockListItemWithSettings()
    {
        // Arrange
        var contentElementMock = CreateMockElement("contentAlias");
        var settingsElementMock = CreateMockElement("settingsAlias");
        var contentKey = Guid.NewGuid();
        var settingsKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockList,
            contentType: typeof(TestContentModel),
            contentElement: contentElementMock.Object,
            settingsType: typeof(TestSettingsModel),
            settingsElement: settingsElementMock.Object,
            contentKey: contentKey,
            settingsKey: settingsKey);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<BlockListItem<TestContentModel, TestSettingsModel>>());

        var blockItem = result as BlockListItem<TestContentModel, TestSettingsModel>;
        Assert.That(blockItem!.Content, Is.Not.Null);
        Assert.That(blockItem.Settings, Is.Not.Null);
    }

    [Test]
    public void CreateBlockInstance_BlockGrid_ReturnsBlockGridItem()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");
        var contentKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockGrid,
            contentType: typeof(TestContentModel),
            contentElement: elementMock.Object,
            settingsType: null,
            settingsElement: null,
            contentKey: contentKey,
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<BlockGridItem<TestContentModel>>());
    }

    [Test]
    public void CreateBlockInstance_RichText_ReturnsRichTextBlockItem()
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");
        var contentKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.RichText,
            contentType: typeof(TestContentModel),
            contentElement: elementMock.Object,
            settingsType: null,
            settingsElement: null,
            contentKey: contentKey,
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.InstanceOf<RichTextBlockItem<TestContentModel>>());
    }

    #endregion

    #region CreateBlockInstance Untyped Fallback Tests

    [TestCase(BlockType.BlockList)]
    [TestCase(BlockType.BlockGrid)]
    [TestCase(BlockType.RichText)]
    public void CreateBlockInstance_WithIPublishedElementType_ReturnsBaseBlockItem(BlockType blockType)
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");
        var contentKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            blockType,
            contentType: typeof(IPublishedElement),
            contentElement: elementMock.Object,
            settingsType: null,
            settingsElement: null,
            contentKey: contentKey,
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Not.Null);

        var expectedType = blockType switch
        {
            BlockType.BlockGrid => typeof(BlockGridItem),
            BlockType.BlockList => typeof(BlockListItem),
            BlockType.RichText => typeof(RichTextBlockItem),
            _ => throw new ArgumentOutOfRangeException()
        };

        Assert.That(result!.GetType(), Is.EqualTo(expectedType));
    }

    [Test]
    public void CreateBlockInstance_WithIPublishedElementType_PassesContentAndSettings()
    {
        // Arrange
        var contentElementMock = CreateMockElement("contentAlias");
        var settingsElementMock = CreateMockElement("settingsAlias");
        var contentKey = Guid.NewGuid();
        var settingsKey = Guid.NewGuid();

        // Act
        var result = _factory.CreateBlockInstance(
            BlockType.BlockList,
            contentType: typeof(IPublishedElement),
            contentElement: contentElementMock.Object,
            settingsType: typeof(IPublishedElement),
            settingsElement: settingsElementMock.Object,
            contentKey: contentKey,
            settingsKey: settingsKey) as BlockListItem;

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Content, Is.SameAs(contentElementMock.Object));
        Assert.That(result.Settings, Is.SameAs(settingsElementMock.Object));
        Assert.That(result.ContentKey, Is.EqualTo(contentKey));
        Assert.That(result.SettingsKey, Is.EqualTo(settingsKey));
    }

    #endregion

    #region CreateBlockItem Type Selection Tests

    [TestCase(BlockType.BlockGrid)]
    [TestCase(BlockType.BlockList)]
    [TestCase(BlockType.RichText)]
    public void CreateBlockItem_AllBlockTypes_CreateCorrectType(BlockType blockType)
    {
        // Arrange
        var elementMock = CreateMockElement("testAlias");
        var contentKey = Guid.NewGuid();
        var contentInstance = new TestContentModel(elementMock.Object, _publishedValueFallbackMock.Object);

        // Act
        var result = _factory.CreateBlockItem(
            blockType,
            contentType: typeof(TestContentModel),
            contentInstance: contentInstance,
            settingsType: null,
            settingsInstance: null,
            contentKey: contentKey,
            settingsKey: null);

        // Assert
        Assert.That(result, Is.Not.Null);

        var expectedType = blockType switch
        {
            BlockType.BlockGrid => typeof(BlockGridItem<TestContentModel>),
            BlockType.BlockList => typeof(BlockListItem<TestContentModel>),
            BlockType.RichText => typeof(RichTextBlockItem<TestContentModel>),
            _ => throw new ArgumentOutOfRangeException()
        };

        Assert.That(result, Is.InstanceOf(expectedType));
    }

    #endregion

    #region Helper Methods

    private static Mock<IPublishedElement> CreateMockElement(string alias)
    {
        var contentTypeMock = new Mock<IPublishedContentType>();
        contentTypeMock.Setup(ct => ct.Alias).Returns(alias);

        var elementMock = new Mock<IPublishedElement>();
        elementMock.Setup(e => e.ContentType).Returns(contentTypeMock.Object);

        return elementMock;
    }

    #endregion

    #region Test Models

    /// <summary>
    /// Test content model with the expected constructor signature.
    /// </summary>
    public class TestContentModel : PublishedElementModel
    {
        public IPublishedElement Element { get; }
        public IPublishedValueFallback Fallback { get; }

        public TestContentModel(IPublishedElement element, IPublishedValueFallback fallback)
            : base(element, fallback)
        {
            Element = element;
            Fallback = fallback;
        }
    }

    /// <summary>
    /// Test settings model with the expected constructor signature.
    /// </summary>
    public class TestSettingsModel : PublishedElementModel
    {
        public TestSettingsModel(IPublishedElement element, IPublishedValueFallback fallback)
            : base(element, fallback)
        {
        }
    }

    /// <summary>
    /// Invalid model without the expected constructor.
    /// </summary>
    public class InvalidModel
    {
        public InvalidModel() { }
    }

    #endregion
}
