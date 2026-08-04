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
        // dependencies not exposed via any interface) and is passed null here. None of the five
        // tests below reach FindBlockType (each returns from an earlier guard clause — invalid
        // block data, invalid content key, or an unresolvable element), so this is safe for what
        // they test. The "no generated models" branch (FindBlockType returning null) genuinely
        // isn't unit-testable without a real BlockEditorConverter or a running Umbraco host —
        // it stays covered only by the manual smoke test in Task 4's Step 6, matching how the
        // pre-refactor BlockPreviewService (zero tests before this task) covered it. Do not
        // "fix" this by constructing a real BlockEditorConverter; that needs an IPublishedModelFactory
        // + content-cache dependency graph well beyond this task's scope.
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
}
