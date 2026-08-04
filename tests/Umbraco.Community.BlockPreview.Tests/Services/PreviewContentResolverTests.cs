using Microsoft.Extensions.Caching.Memory;
using Moq;
using NUnit.Framework;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Tests.Services;

[TestFixture]
public class PreviewContentResolverTests
{
    private Mock<IUmbracoContextAccessor> _umbracoContextAccessor = null!;
    private Mock<ILanguageService> _languageService = null!;
    private ContextCultureService _contextCultureService = null!;
    private Mock<IPublishedContentTypeCache> _contentTypeCache = null!;
    private Mock<IDocumentCacheService> _documentCacheService = null!;
    private Mock<IScopeProvider> _scopeProvider = null!;
    private Mock<IAppPolicyCache> _runtimeCache = null!;
    private Mock<IVariationContextAccessor> _variationContextAccessor = null!;
    private PreviewContentResolver _resolver = null!;

    [SetUp]
    public void SetUp()
    {
        _umbracoContextAccessor = new Mock<IUmbracoContextAccessor>();
        _languageService = new Mock<ILanguageService>();
        // ContextCultureService has no parameterless constructor and no getter — it only
        // writes into IVariationContextAccessor.VariationContext via SetCulture. Construct
        // it with a mocked accessor and assert against that mock, not against the service.
        _variationContextAccessor = new Mock<IVariationContextAccessor>();
        _contextCultureService = new ContextCultureService(_variationContextAccessor.Object);
        _contentTypeCache = new Mock<IPublishedContentTypeCache>();
        _documentCacheService = new Mock<IDocumentCacheService>();
        _scopeProvider = new Mock<IScopeProvider>();
        _runtimeCache = new Mock<IAppPolicyCache>();

        // Runtime cache: IAppPolicyCache.Get is the interface member the GetCacheItem<T>
        // extension method delegates to under the hood (verified by reflection against the
        // real Umbraco.Cms.Core 17.3.0 assembly — GetCacheItem is not itself an interface
        // member, so it can't be mocked directly). Run the factory delegate immediately, no
        // actual caching.
        _runtimeCache
            .Setup(c => c.Get(It.IsAny<string>(), It.IsAny<Func<object?>>(), It.IsAny<TimeSpan?>(),
                It.IsAny<bool>()))
            .Returns((string _, Func<object?> factory, TimeSpan? _, bool _) => factory());

        var scopeMock = new Mock<Umbraco.Cms.Infrastructure.Scoping.IScope>();
        _scopeProvider.Setup(s => s.CreateScope(
            It.IsAny<System.Data.IsolationLevel>(),
            It.IsAny<Umbraco.Cms.Core.Scoping.RepositoryCacheMode>(),
            It.IsAny<Umbraco.Cms.Core.Events.IEventDispatcher>(),
            It.IsAny<Umbraco.Cms.Core.Events.IScopedNotificationPublisher>(),
            It.IsAny<bool?>(),
            It.IsAny<bool>(),
            It.IsAny<bool>())).Returns(scopeMock.Object);

        _resolver = new PreviewContentResolver(
            _umbracoContextAccessor.Object,
            Mock.Of<IPublishedRouter>(),
            _languageService.Object,
            _contextCultureService,
            _contentTypeCache.Object,
            _documentCacheService.Object,
            _scopeProvider.Object,
            _runtimeCache.Object);
    }

    [Test]
    public void Resolve_WithNoUmbracoContext_ReturnsNull()
    {
        IUmbracoContext? context = null;
        _umbracoContextAccessor
            .Setup(a => a.TryGetUmbracoContext(out context))
            .Returns(false);

        var result = _resolver.Resolve(Guid.NewGuid(), Guid.NewGuid(), out bool isActualContent);

        Assert.That(result, Is.Null);
        Assert.That(isActualContent, Is.False);
    }

    [Test]
    public async Task ResolveCultureAsync_WithExplicitCulture_UsesItAndSetsContextCulture()
    {
        var culture = await _resolver.ResolveCultureAsync("da-DK", content: null);

        Assert.That(culture, Is.EqualTo("da-DK"));
        _variationContextAccessor.VerifySet(
            a => a.VariationContext = It.Is<VariationContext>(vc => vc.Culture == "da-DK"), Times.Once);
    }

    [Test]
    public async Task ResolveCultureAsync_WithUndefinedString_FallsBackToDefaultLanguage()
    {
        _languageService.Setup(l => l.GetAllAsync())
            .ReturnsAsync(new List<Umbraco.Cms.Core.Models.ILanguage>
            {
                Mock.Of<Umbraco.Cms.Core.Models.ILanguage>(l => l.IsoCode == "en-US"),
                Mock.Of<Umbraco.Cms.Core.Models.ILanguage>(l => l.IsoCode == "da-DK"),
            });
        _languageService.Setup(l => l.GetDefaultIsoCodeAsync()).ReturnsAsync("en-US");

        var culture = await _resolver.ResolveCultureAsync("undefined", content: null);

        Assert.That(culture, Is.EqualTo("en-US"));
    }

    [Test]
    public async Task ResolveCultureAsync_WithSingleConfiguredLanguage_UsesItRegardlessOfDefaultFlag()
    {
        _languageService.Setup(l => l.GetAllAsync())
            .ReturnsAsync(new List<Umbraco.Cms.Core.Models.ILanguage>
            {
                Mock.Of<Umbraco.Cms.Core.Models.ILanguage>(l => l.IsoCode == "da-DK"),
            });

        var culture = await _resolver.ResolveCultureAsync(null, content: null);

        Assert.That(culture, Is.EqualTo("da-DK"));
        _languageService.Verify(l => l.GetDefaultIsoCodeAsync(), Times.Never);
    }
}
