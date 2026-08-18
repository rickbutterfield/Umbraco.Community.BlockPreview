using NUnit.Framework;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.Tests.Services;

[TestFixture]
public class MarkupSanitizerTests
{
    private MarkupSanitizer _sanitizer = null!;

    [SetUp]
    public void SetUp() => _sanitizer = new MarkupSanitizer();

    [Test]
    public void CleanUp_WithNullOrWhitespace_ReturnsInputUnchanged()
    {
        Assert.That(_sanitizer.CleanUp(""), Is.EqualTo(""));
        Assert.That(_sanitizer.CleanUp("   "), Is.EqualTo("   "));
    }

    [Test]
    public void CleanUp_RewritesAnchorHrefsAndMarksThemAsBlockPreviewLinks()
    {
        var result = _sanitizer.CleanUp("<a href=\"/some/page\">link</a>");

        Assert.That(result, Does.Contain("href=\"javascript:;\""));
        Assert.That(result, Does.Contain("data-block-preview-link=\"true\""));
    }

    [Test]
    public void CleanUp_DisablesFormElements()
    {
        var result = _sanitizer.CleanUp("<input type=\"text\" /><textarea></textarea><select></select><button>Go</button>");

        Assert.That(result, Does.Match("<input[^>]*disabled=\"disabled\""));
        Assert.That(result, Does.Match("<textarea[^>]*disabled=\"disabled\""));
        Assert.That(result, Does.Match("<select[^>]*disabled=\"disabled\""));
        Assert.That(result, Does.Match("<button[^>]*disabled=\"disabled\""));
    }

    [Test]
    public void CleanUp_WithNoLinksOrForms_LeavesMarkupIntact()
    {
        var result = _sanitizer.CleanUp("<div class=\"hero\"><h1>Title</h1></div>");

        Assert.That(result, Is.EqualTo("<div class=\"hero\"><h1>Title</h1></div>"));
    }
}
