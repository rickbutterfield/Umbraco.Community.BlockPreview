using NUnit.Framework;

namespace Umbraco.Community.BlockPreview.Tests.Services;

/// <summary>
/// Tests for BlockTypeCacheService.
/// Note: Full integration tests for caching behavior require an Umbraco runtime.
/// These tests validate the cache key format constants.
/// </summary>
[TestFixture]
public class BlockTypeCacheServiceTests
{
    #region Cache Key Format Tests

    [Test]
    public void CacheKeys_ContentType_HasCorrectFormat()
    {
        // Arrange
        var testGuid = Guid.NewGuid();

        // Act
        var cacheKey = string.Format(Constants.CacheKeys.ContentType, testGuid);

        // Assert
        Assert.That(cacheKey, Does.Contain(testGuid.ToString()));
        Assert.That(Constants.CacheKeys.ContentType, Does.Contain("{0}"));
    }

    [Test]
    public void CacheKeys_DataType_HasCorrectFormat()
    {
        // Arrange
        var testGuid = Guid.NewGuid();

        // Act
        var cacheKey = string.Format(Constants.CacheKeys.DataType, testGuid);

        // Assert
        Assert.That(cacheKey, Does.Contain(testGuid.ToString()));
        Assert.That(Constants.CacheKeys.DataType, Does.Contain("{0}"));
    }

    [Test]
    public void CacheKeys_ContentType_IsDifferentFromDataType()
    {
        // Arrange
        var testGuid = Guid.NewGuid();

        // Act
        var contentTypeCacheKey = string.Format(Constants.CacheKeys.ContentType, testGuid);
        var dataTypeCacheKey = string.Format(Constants.CacheKeys.DataType, testGuid);

        // Assert
        Assert.That(contentTypeCacheKey, Is.Not.EqualTo(dataTypeCacheKey));
    }

    [Test]
    public void CacheKeys_GenerateUniqueKeysForDifferentGuids()
    {
        // Arrange
        var guid1 = Guid.NewGuid();
        var guid2 = Guid.NewGuid();

        // Act
        var key1 = string.Format(Constants.CacheKeys.ContentType, guid1);
        var key2 = string.Format(Constants.CacheKeys.ContentType, guid2);

        // Assert
        Assert.That(key1, Is.Not.EqualTo(key2));
    }

    #endregion
}
