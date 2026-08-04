using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Resolves the published content, culture, and published request for a block preview.
    /// </summary>
    public interface IPreviewContentResolver
    {
        /// <summary>
        /// Resolves the content being previewed, preferring an actual node by key and
        /// falling back to a placeholder node of the given document type.
        /// </summary>
        IPublishedContent? Resolve(Guid? nodeKey, Guid? documentTypeUnique, out bool isActualContent);

        /// <summary>
        /// Resolves the culture to render with: the requested culture, then the content's
        /// domain culture, then the sole configured language, then the default language.
        /// Also sets the resolved culture on <see cref="ContextCultureService"/>.
        /// </summary>
        Task<string?> ResolveCultureAsync(string? requestedCulture, IPublishedContent? content);

        /// <summary>
        /// Builds and assigns a <c>PublishedRequest</c> on the current Umbraco context so
        /// downstream rendering sees the given culture and content.
        /// </summary>
        Task SetupPublishedRequestAsync(string? culture, IPublishedContent? content, Uri requestUrl);
    }
}
