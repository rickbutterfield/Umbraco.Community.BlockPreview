using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Controllers;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Tests.Controllers;

[TestFixture]
public class BlockPreviewApiControllerTests
{
    private Mock<IPreviewRequestExecutor> _executor = null!;
    private Mock<IMarkupSanitizer> _sanitizer = null!;
    private Mock<IPreviewContentResolver> _contentResolver = null!;
    private Mock<IBlockPreviewService> _blockPreviewService = null!;
    private BlockPreviewApiController _controller = null!;

    [SetUp]
    public void SetUp()
    {
        _executor = new Mock<IPreviewRequestExecutor>();
        _sanitizer = new Mock<IMarkupSanitizer>();
        _contentResolver = new Mock<IPreviewContentResolver>();
        _blockPreviewService = new Mock<IBlockPreviewService>();

        _sanitizer.Setup(s => s.CleanUp(It.IsAny<string>())).Returns((string m) => $"clean:{m}");

        // AppCaches has no parameterless constructor, so Mock.Of<AppCaches>() can't proxy it.
        // Build a real instance from mocked sub-caches instead, matching the pattern already
        // used in NotificationHandlers/DataTypeSavedNotificationHandlerTests.cs.
        var appCaches = new AppCaches(
            Mock.Of<IAppPolicyCache>(),
            Mock.Of<IRequestCache>(),
            new IsolatedCaches(_ => Mock.Of<IAppPolicyCache>()));

        _controller = new BlockPreviewApiController(
            _executor.Object,
            _sanitizer.Object,
            _contentResolver.Object,
            _blockPreviewService.Object,
            Mock.Of<IOptions<BlockPreviewOptions>>(o => o.Value == new BlockPreviewOptions()),
            appCaches,
            Mock.Of<IBlockPreviewRequestEnricher>())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }

    [TearDown]
    public void TearDown() => (_controller as IDisposable)?.Dispose();

    [Test]
    public async Task PreviewGridBlock_SanitizesExecutorOutputAndReturnsOk()
    {
        _executor
            .Setup(e => e.ExecuteAsync(It.IsAny<PreviewRenderRequest>(),
                It.IsAny<Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>()))
            .ReturnsAsync("<div>grid</div>");

        var result = await _controller.PreviewGridBlock("{}", Guid.NewGuid(), "myGrid", "myElement");

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(ok!.Value, Is.EqualTo("clean:<div>grid</div>"));
    }

    [Test]
    public async Task PreviewGridBlock_PassesRenderDelegateThatCallsRenderGridBlock()
    {
        // Guards against a method-name swap between PreviewGridBlock/PreviewListBlock/PreviewSingleBlock:
        // PreviewGridBlock_SanitizesExecutorOutputAndReturnsOk above only checks sanitization, which would
        // still pass even if the controller wired up the wrong IBlockPreviewService method as the render delegate.
        Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>? captured = null;
        _executor
            .Setup(e => e.ExecuteAsync(It.IsAny<PreviewRenderRequest>(),
                It.IsAny<Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>()))
            .Callback<PreviewRenderRequest, Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>(
                (_, render) => captured = render)
            .ReturnsAsync("<div>grid</div>");

        var content = Mock.Of<IPublishedContent>();
        _blockPreviewService
            .Setup(s => s.RenderGridBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null))
            .ReturnsAsync("<div>grid-direct</div>");

        await _controller.PreviewGridBlock("{}", Guid.NewGuid(), "myGrid", "myElement");

        Assert.That(captured, Is.Not.Null);
        var direct = await captured!("{}", content, new ControllerContext(), "ignored", Guid.Empty, "ignored", null, null);
        Assert.That(direct, Is.EqualTo("<div>grid-direct</div>"));
        _blockPreviewService.Verify(s => s.RenderGridBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null), Times.Once);
    }

    [Test]
    public async Task PreviewListBlock_PassesRenderDelegateThatCallsRenderListBlock()
    {
        Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>? captured = null;
        _executor
            .Setup(e => e.ExecuteAsync(It.IsAny<PreviewRenderRequest>(),
                It.IsAny<Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>()))
            .Callback<PreviewRenderRequest, Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>(
                (_, render) => captured = render)
            .ReturnsAsync("<div>list</div>");

        var content = Mock.Of<IPublishedContent>();
        _blockPreviewService
            .Setup(s => s.RenderListBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null))
            .ReturnsAsync("<div>list-direct</div>");

        await _controller.PreviewListBlock("{}", Guid.NewGuid(), "myList", "myElement");

        Assert.That(captured, Is.Not.Null);
        var direct = await captured!("{}", content, new ControllerContext(), "ignored", Guid.Empty, "ignored", null, null);
        Assert.That(direct, Is.EqualTo("<div>list-direct</div>"));
        _blockPreviewService.Verify(s => s.RenderListBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null), Times.Once);
    }

    [Test]
    public async Task PreviewSingleBlock_PassesRenderDelegateThatCallsRenderSingleBlock()
    {
        Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>? captured = null;
        _executor
            .Setup(e => e.ExecuteAsync(It.IsAny<PreviewRenderRequest>(),
                It.IsAny<Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>()))
            .Callback<PreviewRenderRequest, Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>(
                (_, render) => captured = render)
            .ReturnsAsync("<div>single</div>");

        var content = Mock.Of<IPublishedContent>();
        _blockPreviewService
            .Setup(s => s.RenderSingleBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null))
            .ReturnsAsync("<div>single-direct</div>");

        await _controller.PreviewSingleBlock("{}", Guid.NewGuid(), "mySingle", "myElement");

        Assert.That(captured, Is.Not.Null);
        var direct = await captured!("{}", content, new ControllerContext(), "ignored", Guid.Empty, "ignored", null, null);
        Assert.That(direct, Is.EqualTo("<div>single-direct</div>"));
        _blockPreviewService.Verify(s => s.RenderSingleBlock("{}", content, It.IsAny<ControllerContext>(), "ignored", Guid.Empty, "ignored", null, null), Times.Once);
    }

    [Test]
    public async Task PreviewRichTextMarkup_PassesRenderDelegateThatCallsRenderRichTextBlock()
    {
        Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>? captured = null;
        _executor
            .Setup(e => e.ExecuteAsync(It.IsAny<PreviewRenderRequest>(),
                It.IsAny<Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>()))
            .Callback<PreviewRenderRequest, Func<string, IPublishedContent, ControllerContext, string, Guid, string, string?, int?, Task<string>>>(
                (_, render) => captured = render)
            .ReturnsAsync("<div>rte</div>");

        var content = Mock.Of<IPublishedContent>();
        _blockPreviewService
            .Setup(s => s.RenderRichTextBlock("{}", content, It.IsAny<ControllerContext>()))
            .ReturnsAsync("<div>rte-direct</div>");

        await _controller.PreviewRichTextMarkup("{}", Guid.NewGuid(), "myRte", "myElement");

        Assert.That(captured, Is.Not.Null);
        var direct = await captured!("{}", content, new ControllerContext(), "ignored", Guid.Empty, "ignored", null, null);
        Assert.That(direct, Is.EqualTo("<div>rte-direct</div>"));
    }

    [Test]
    public async Task GetGridStylesheets_ResolvesContentViaContentResolverThenAsksBlockPreviewService()
    {
        var nodeKey = Guid.NewGuid();
        var docType = Guid.NewGuid();
        var content = Mock.Of<IPublishedContent>();
        // IPreviewContentResolver.Resolve's 3rd parameter is `out bool isActualContent`, not an
        // out IPublishedContent — the resolved content comes back via the return value instead
        // (matches Task 3's PreviewRequestExecutorTests.cs usage of the same interface).
        bool isActualContent = true;
        _contentResolver.Setup(r => r.Resolve(nodeKey, docType, out isActualContent)).Returns(content);
        _blockPreviewService
            .Setup(s => s.GetStylesheetPaths(BlockType.BlockGrid, content, It.IsAny<ControllerContext>()))
            .ReturnsAsync(new List<string> { "/css/grid.css" });

        var result = await _controller.GetGridStylesheets(nodeKey, docType);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(ok!.Value, Is.EqualTo(new List<string> { "/css/grid.css" }));
        _contentResolver.Verify(r => r.Resolve(nodeKey, docType, out isActualContent), Times.Once);
    }
}
