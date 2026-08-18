using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache.PropertyEditors;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Tests.Services;

[TestFixture]
public class BlockPreviewServiceTests
{
    private Mock<IPublishedModelFactory> _publishedModelFactory = null!;
    private Mock<IJsonSerializer> _jsonSerializer = null!;
    private Mock<IBlockModelFactory> _blockModelFactory = null!;
    private Mock<IBlockViewRenderer> _blockViewRenderer = null!;
    private Mock<IBlockDataConverter> _blockDataConverter = null!;
    private Mock<IBlockTypeCacheService> _blockTypeCacheService = null!;
    private Mock<IBlockPreviewViewResolver> _viewResolver = null!;
    private BlockPreviewService _service = null!;

    private readonly Guid _contentKey = Guid.NewGuid();
    private IPublishedContent _content = null!;
    private IPublishedElement _contentElement = null!;
    private IPublishedContentType _contentType = null!;

    [SetUp]
    public void SetUp()
    {
        _publishedModelFactory = new Mock<IPublishedModelFactory>();
        _jsonSerializer = new Mock<IJsonSerializer>();
        _blockModelFactory = new Mock<IBlockModelFactory>();
        _blockViewRenderer = new Mock<IBlockViewRenderer>();
        _blockDataConverter = new Mock<IBlockDataConverter>();
        _blockTypeCacheService = new Mock<IBlockTypeCacheService>();
        _viewResolver = new Mock<IBlockPreviewViewResolver>();

        _contentType = Mock.Of<IPublishedContentType>(t => t.Alias == "myElement" && t.Key == Guid.NewGuid());
        _contentElement = Mock.Of<IPublishedElement>(e => e.ContentType == _contentType);
        _content = Mock.Of<IPublishedContent>();

        _blockDataConverter.Setup(c => c.ConvertToElement(It.IsAny<BlockItemData>(), _content)).Returns(_contentElement);
        _blockViewRenderer.Setup(r => r.RenderAsync(It.IsAny<BlockPreviewContext>(), It.IsAny<ViewEngineResult?>()))
            .ReturnsAsync("<div>rendered</div>");

        // BlockEditorConverter can't be mocked directly (concrete Umbraco type with internal
        // dependencies not exposed via any interface) and is passed null here. Five of the six
        // tests below never reach FindBlockType (each returns from an earlier guard clause — invalid
        // block data, invalid content key, or an unresolvable element), so this is safe for what
        // they test. The sixth test (RenderGridBlock_WithMatchingLayout_AppliesRowAndColumnSpanBeforeRendering)
        // needs FindBlockType and uses the TestableBlockPreviewService subclass below to bypass the real,
        // unmockable BlockEditorConverter instead of constructing one. The "no generated models" branch
        // (FindBlockType returning null) genuinely isn't unit-testable without a real BlockEditorConverter or a
        // running Umbraco host — it stays covered only by the manual smoke test in Task 4's Step 6, matching
        // how the pre-refactor BlockPreviewService (zero tests before this task) covered it.
        _service = new BlockPreviewService(
            _publishedModelFactory.Object,
            blockEditorConverter: null!,
            Microsoft.Extensions.Options.Options.Create(new BlockPreviewOptions()),
            _jsonSerializer.Object,
            _blockModelFactory.Object,
            _blockViewRenderer.Object,
            _blockDataConverter.Object,
            _blockTypeCacheService.Object,
            _viewResolver.Object);
    }

    [Test]
    public async Task RenderListBlock_WithInvalidBlockData_ReturnsInvalidBlockDataError()
    {
        _blockDataConverter.Setup(c => c.DeserializeBlockList(It.IsAny<string>())).Returns((BlockEditorData<BlockListValue, BlockListLayoutItem>?)null);

        var result = await _service.RenderListBlock("not-json", _content, new ControllerContext());

        Assert.That(result, Does.Contain(Constants.ErrorMessages.InvalidBlockData));
    }

    [Test]
    public async Task RenderListBlock_WithUnknownContentKey_ReturnsInvalidContentKeyError()
    {
        var value = new BlockListValue { ContentData = new List<BlockItemData> { new(_contentKey, Guid.NewGuid(), "myElement") } };
        _blockDataConverter.Setup(c => c.DeserializeBlockList(It.IsAny<string>()))
            .Returns(new BlockEditorData<BlockListValue, BlockListLayoutItem>(Array.Empty<ContentAndSettingsReference>(), value));

        var result = await _service.RenderListBlock("{}", _content, new ControllerContext(), contentKey: "not-a-guid");

        Assert.That(result, Does.Contain(Constants.ErrorMessages.InvalidContentKey));
    }

    [Test]
    public async Task RenderListBlock_WithUnresolvableElement_ReturnsInvalidContentDataError()
    {
        var value = new BlockListValue { ContentData = new List<BlockItemData> { new(_contentKey, Guid.NewGuid(), "myElement") } };
        _blockDataConverter.Setup(c => c.DeserializeBlockList(It.IsAny<string>()))
            .Returns(new BlockEditorData<BlockListValue, BlockListLayoutItem>(Array.Empty<ContentAndSettingsReference>(), value));
        _blockDataConverter.Setup(c => c.ConvertToElement(It.IsAny<BlockItemData>(), _content)).Returns((IPublishedElement)null!);

        var result = await _service.RenderListBlock("{}", _content, new ControllerContext(), contentKey: _contentKey.ToString());

        Assert.That(result, Does.Contain(Constants.ErrorMessages.InvalidContentData));
    }

    [Test]
    public async Task RenderSingleBlock_UsesTheSameSharedTailAsRenderListBlock()
    {
        // Same fixture as RenderListBlock's unresolvable-element case, proving Single
        // routes through the identical shared helper (both cast to BlockListItem).
        var value = new SingleBlockValue { ContentData = new List<BlockItemData> { new(_contentKey, Guid.NewGuid(), "myElement") } };
        _blockDataConverter.Setup(c => c.DeserializeSingleBlock(It.IsAny<string>()))
            .Returns(new BlockEditorData<SingleBlockValue, SingleBlockLayoutItem>(Array.Empty<ContentAndSettingsReference>(), value));
        _blockDataConverter.Setup(c => c.ConvertToElement(It.IsAny<BlockItemData>(), _content)).Returns((IPublishedElement)null!);

        var result = await _service.RenderSingleBlock("{}", _content, new ControllerContext(), contentKey: _contentKey.ToString());

        Assert.That(result, Does.Contain(Constants.ErrorMessages.InvalidContentData));
    }

    [Test]
    public async Task RenderRichTextBlock_WithNoContentData_ReturnsInvalidContentDataError()
    {
        var value = new RichTextBlockValue { ContentData = new List<BlockItemData>() };
        _blockDataConverter.Setup(c => c.DeserializeRichText(It.IsAny<string>()))
            .Returns(new BlockEditorData<RichTextBlockValue, RichTextBlockLayoutItem>(Array.Empty<ContentAndSettingsReference>(), value));

        var result = await _service.RenderRichTextBlock("{}", _content, new ControllerContext());

        Assert.That(result, Does.Contain(Constants.ErrorMessages.InvalidContentData));
    }

    [Test]
    public async Task RenderGridBlock_WithMatchingLayout_AppliesRowAndColumnSpanBeforeRendering()
    {
        // Exercises the `configure` callback wired up in RenderGridBlock (BlockPreviewService.cs),
        // which threads GetMatchingGridLayout's matched RowSpan/ColumnSpan onto the created block
        // instance. This path had zero test coverage before, because it requires a real BlockGridItem
        // instance (not mockable) and previously required the real, unmockable BlockEditorConverter to
        // reach FindBlockType. FindBlockType is now `protected virtual` (source/binary compatible change)
        // specifically so TestableBlockPreviewService below can bypass it.
        var contentTypeKey = Guid.NewGuid();
        var documentTypeUnique = Guid.NewGuid();
        var dataTypeKey = Guid.NewGuid();
        const string blockEditorAlias = "myGrid";

        var layoutItem = new BlockGridLayoutItem(_contentKey) { RowSpan = 3, ColumnSpan = 6 };
        var blockGridValue = new BlockGridValue(new[] { layoutItem })
        {
            ContentData = new List<BlockItemData> { new(_contentKey, contentTypeKey, "myElement") }
        };
        var blockEditorData = new BlockEditorData<BlockGridValue, BlockGridLayoutItem>(
            Array.Empty<ContentAndSettingsReference>(), blockGridValue);

        _blockDataConverter.Setup(c => c.DeserializeBlockGrid(It.IsAny<string>())).Returns(blockEditorData);

        var blockGridConfig = new BlockGridConfiguration
        {
            Blocks = new[]
            {
                new BlockGridConfiguration.BlockGridBlockConfiguration
                {
                    ContentElementTypeKey = contentTypeKey,
                    Areas = Array.Empty<BlockGridConfiguration.BlockGridAreaConfiguration>()
                }
            }
        };

        var propertyType = Mock.Of<IPropertyType>(p => p.Alias == blockEditorAlias && p.DataTypeKey == dataTypeKey);
        var documentType = Mock.Of<IContentType>(c =>
            c.PropertyTypes == new List<IPropertyType> { propertyType } &&
            c.CompositionPropertyTypes == new List<IPropertyType>());
        var dataType = Mock.Of<IDataType>(d => d.ConfigurationObject == (object)blockGridConfig);

        _blockTypeCacheService.Setup(s => s.GetContentType(documentTypeUnique)).ReturnsAsync(documentType);
        _blockTypeCacheService.Setup(s => s.GetDataType(dataTypeKey)).ReturnsAsync(dataType);

        var blockInstance = new BlockGridItem(_contentKey, _contentElement, null, null);
        _blockModelFactory
            .Setup(f => f.CreateBlockInstance(BlockType.BlockGrid, typeof(object), _contentElement, null, null, _contentKey, null))
            .Returns(blockInstance);

        BlockPreviewContext? capturedContext = null;
        _blockViewRenderer
            .Setup(r => r.RenderAsync(It.IsAny<BlockPreviewContext>(), It.IsAny<ViewEngineResult?>()))
            .Callback<BlockPreviewContext, ViewEngineResult?>((ctx, _) => capturedContext = ctx)
            .ReturnsAsync("<div>grid</div>");

        var service = new TestableBlockPreviewService(
            _publishedModelFactory.Object,
            blockEditorConverter: null!,
            Microsoft.Extensions.Options.Options.Create(new BlockPreviewOptions()),
            _jsonSerializer.Object,
            _blockModelFactory.Object,
            _blockViewRenderer.Object,
            _blockDataConverter.Object,
            _blockTypeCacheService.Object,
            _viewResolver.Object);

        var result = await service.RenderGridBlock(
            "{}", _content, new ControllerContext(), blockEditorAlias, documentTypeUnique,
            contentKey: _contentKey.ToString());

        Assert.That(result, Is.EqualTo("<div>grid</div>"));
        Assert.That(capturedContext, Is.Not.Null);
        var renderedInstance = capturedContext!.ViewData?.Model as BlockGridItem;
        Assert.That(renderedInstance, Is.Not.Null);
        Assert.That(renderedInstance!.RowSpan, Is.EqualTo(3));
        Assert.That(renderedInstance!.ColumnSpan, Is.EqualTo(6));
    }

    /// <summary>
    /// Subclass that bypasses the real (unmockable, sealed) <see cref="BlockEditorConverter"/> by
    /// overriding the now-<c>protected virtual</c> <c>FindBlockType</c> to always return a known
    /// type, so tests can drive the rest of the render pipeline (including the Block Grid
    /// `configure` callback) without a running Umbraco host.
    /// </summary>
    private class TestableBlockPreviewService : BlockPreviewService
    {
        public TestableBlockPreviewService(
            IPublishedModelFactory publishedModelFactory,
            BlockEditorConverter blockEditorConverter,
            Microsoft.Extensions.Options.IOptions<BlockPreviewOptions> options,
            IJsonSerializer jsonSerializer,
            IBlockModelFactory blockModelFactory,
            IBlockViewRenderer blockViewRenderer,
            IBlockDataConverter blockDataConverter,
            IBlockTypeCacheService blockTypeCacheService,
            IBlockPreviewViewResolver viewResolver)
            : base(
                publishedModelFactory, blockEditorConverter, options, jsonSerializer, blockModelFactory,
                blockViewRenderer, blockDataConverter, blockTypeCacheService, viewResolver)
        {
        }

        protected override Type? FindBlockType(IPublishedContentType? contentType) => typeof(object);
    }
}
