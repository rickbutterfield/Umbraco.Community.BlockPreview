using Umbraco.Cms.Core.Models;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Service for caching content types and data types.
    /// </summary>
    public interface IBlockTypeCacheService
    {
        /// <summary>
        /// Gets a content type by its unique identifier, with caching.
        /// </summary>
        /// <param name="documentTypeUnique">The unique identifier of the content type.</param>
        /// <returns>The content type, or null if not found.</returns>
        IContentType? GetContentType(Guid documentTypeUnique);

        /// <summary>
        /// Gets a data type by its key, with caching.
        /// </summary>
        /// <param name="dataTypeKey">The key of the data type.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the data type, or null if not found.</returns>
        Task<IDataType?> GetDataType(Guid dataTypeKey);
    }
}
