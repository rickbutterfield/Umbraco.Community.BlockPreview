using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Tests.Services;

[TestFixture]
public class PreviewRequestExecutorTests
{
    private Mock<IPreviewContentResolver> _contentResolver = null!;
    private Mock<IBlockPreviewRequestEnricher> _requestEnricher = null!;
    private Mock<IBlockPreviewResponseEnricher> _responseEnricher = null!;
    private Mock<IAppPolicyCache> _runtimeCache = null!;
    private Mock<ITypeFinder> _typeFinder = null!;
    private Mock<ILogger<PreviewRequestExecutor>> _logger = null!;
    private PreviewRequestExecutor _executor = null!;

    [SetUp]
    public void SetUp()
    {
        _contentResolver = new Mock<IPreviewContentResolver>();
        _requestEnricher = new Mock<IBlockPreviewRequestEnricher>();
        _responseEnricher = new Mock<IBlockPreviewResponseEnricher>();
        _runtimeCache = new Mock<IAppPolicyCache>();
        _typeFinder = new Mock<ITypeFinder>();
        _logger = new Mock<ILogger<PreviewRequestExecutor>>();

        // IAppPolicyCache.GetCacheItem<T>(...) is an extension method (Umbraco.Extensions.AppCacheExtensions),
        // not a mockable interface member — it delegates to IAppPolicyCache.Get(string, Func<object?>, TimeSpan?, bool).
        // Mock that instead, matching Task 2's PreviewContentResolverTests.
        _runtimeCache
            .Setup(c => c.Get(It.IsAny<string>(), It.IsAny<Func<object?>>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>()))
            .Returns((string _, Func<object?> factory, TimeSpan? _, bool _) => factory());

        _responseEnricher
            .Setup(e => e.EnrichAsync(It.IsAny<string>(), It.IsAny<HttpContext>(), It.IsAny<IPublishedContent?>(),
                It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync((string markup, HttpContext _, IPublishedContent? _, string? _, string? _, string? _, string? _, int? _) => markup);

        _executor = new PreviewRequestExecutor(
            _contentResolver.Object,
            _requestEnricher.Object,
            _responseEnricher.Object,
            _runtimeCache.Object,
            _typeFinder.Object,
            _logger.Object);
    }

    private static PreviewRenderRequest BuildRequest(HttpContext? httpContext = null) => new(
        BlockData: "{}",
        NodeKey: Guid.NewGuid(),
        BlockEditorAlias: "myBlockGrid",
        ContentElementAlias: "myElement",
        Culture: "en-US",
        DocumentTypeUnique: Guid.NewGuid(),
        ContentUdi: "umb://element/abc",
        SettingsUdi: null,
        BlockIndex: 0,
        HttpContext: httpContext ?? DefaultHttpContextWithHost(),
        ControllerContext: new ControllerContext());

    // A bare `new DefaultHttpContext()` has an empty Scheme and Host, so
    // Request.GetDisplayUrl() (called by the executor to build the SetupPublishedRequestAsync
    // Uri) produces "://" — not a valid absolute URI. `new Uri("://")` then throws
    // UriFormatException, which the executor's own catch block swallows into a generic error
    // template, masking whatever the test under exercise actually intended to observe. Give the
    // fake HttpContext a real scheme/host, as a real inbound request would have.
    private static DefaultHttpContext DefaultHttpContextWithHost()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Scheme = "https";
        httpContext.Request.Host = new HostString("localhost");
        return httpContext;
    }

    [Test]
    public async Task ExecuteAsync_WithoutGeneratedModels_ReturnsModelsBuilderWarningAndSkipsRender()
    {
        // ITypeFinder.FindClassesWithAttribute<T>() is an extension method (Umbraco.Extensions.TypeFinderExtensions),
        // not a mockable interface member — it delegates to the non-generic
        // ITypeFinder.FindClassesWithAttribute(Type, IEnumerable<Assembly>, bool). Mock that instead.
        _typeFinder
            .Setup(t => t.FindClassesWithAttribute(
                typeof(Umbraco.Cms.Core.Models.PublishedContent.PublishedModelAttribute),
                It.IsAny<IEnumerable<System.Reflection.Assembly>>(), It.IsAny<bool>()))
            .Returns(Array.Empty<Type>());

        var renderCalled = false;
        var result = await _executor.ExecuteAsync(BuildRequest(), (_, _, _, _, _, _, _, _) =>
        {
            renderCalled = true;
            return Task.FromResult("<div>rendered</div>");
        });

        Assert.That(renderCalled, Is.False);
        Assert.That(result, Does.Contain(Constants.ErrorMessages.ModelsBuilderError));
    }

    [Test]
    public async Task ExecuteAsync_WithGeneratedModels_ResolvesContentAndInvokesRenderWithIt()
    {
        _typeFinder
            .Setup(t => t.FindClassesWithAttribute(
                typeof(Umbraco.Cms.Core.Models.PublishedContent.PublishedModelAttribute),
                It.IsAny<IEnumerable<System.Reflection.Assembly>>(), It.IsAny<bool>()))
            .Returns(new[] { typeof(object) });

        var content = Mock.Of<IPublishedContent>();
        // IPreviewContentResolver.Resolve's 3rd parameter is `out bool isActualContent`, not an
        // out IPublishedContent — the resolved content comes back via the return value instead.
        bool isActualContent = true;
        _contentResolver.Setup(r => r.Resolve(It.IsAny<Guid?>(), It.IsAny<Guid?>(), out isActualContent)).Returns(content);
        _contentResolver.Setup(r => r.ResolveCultureAsync(It.IsAny<string?>(), content)).ReturnsAsync("en-US");

        IPublishedContent? receivedContent = null;
        var result = await _executor.ExecuteAsync(BuildRequest(), (_, c, _, _, _, _, _, _) =>
        {
            receivedContent = c;
            return Task.FromResult("<div>rendered</div>");
        });

        Assert.That(receivedContent, Is.SameAs(content));
        Assert.That(result, Is.EqualTo("<div>rendered</div>"));
        _requestEnricher.Verify(e => e.EnrichAsync(
            It.IsAny<HttpContext>(), content, "myBlockGrid", "myElement", "umb://element/abc", null, 0), Times.Once);
    }

    [Test]
    public async Task ExecuteAsync_WhenRenderThrows_ReturnsErrorTemplateAndLogs()
    {
        _typeFinder
            .Setup(t => t.FindClassesWithAttribute(
                typeof(Umbraco.Cms.Core.Models.PublishedContent.PublishedModelAttribute),
                It.IsAny<IEnumerable<System.Reflection.Assembly>>(), It.IsAny<bool>()))
            .Returns(new[] { typeof(object) });

        bool isActualContent = false;
        _contentResolver.Setup(r => r.Resolve(It.IsAny<Guid?>(), It.IsAny<Guid?>(), out isActualContent)).Returns((IPublishedContent?)null);

        var result = await _executor.ExecuteAsync(BuildRequest(), (_, _, _, _, _, _, _, _) =>
            throw new InvalidOperationException("boom"));

        Assert.That(result, Does.Contain(string.Format(Constants.ErrorMessages.RenderError, "boom")));
        _logger.Verify(l => l.Log(
            LogLevel.Error,
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()), Times.Once);
    }

    [Test]
    public async Task ExecuteAsync_PassesNullNotEmptyStringForOmittedRichTextArgs()
    {
        // Regression guard: the RTE controller action historically called the enrichers
        // with only 4 of the 7 optional args, leaving contentUdi/settingsUdi/blockIndex at
        // their `null` defaults — never empty string. A custom enricher may branch on that.
        _typeFinder
            .Setup(t => t.FindClassesWithAttribute(
                typeof(Umbraco.Cms.Core.Models.PublishedContent.PublishedModelAttribute),
                It.IsAny<IEnumerable<System.Reflection.Assembly>>(), It.IsAny<bool>()))
            .Returns(new[] { typeof(object) });

        bool isActualContent = false;
        _contentResolver.Setup(r => r.Resolve(It.IsAny<Guid?>(), It.IsAny<Guid?>(), out isActualContent)).Returns((IPublishedContent?)null);

        var rteRequest = BuildRequest() with { ContentUdi = null, SettingsUdi = null, BlockIndex = null };

        await _executor.ExecuteAsync(rteRequest, (_, _, _, _, _, _, _, _) => Task.FromResult("<div/>"));

        _requestEnricher.Verify(e => e.EnrichAsync(
            It.IsAny<HttpContext>(), null, "myBlockGrid", "myElement", null, null, null), Times.Once);
    }
}
