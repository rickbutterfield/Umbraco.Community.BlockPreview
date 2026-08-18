namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Sanitizes rendered block preview markup before it is sent to the backoffice.
    /// </summary>
    public interface IMarkupSanitizer
    {
        /// <summary>
        /// Rewrites anchor hrefs to no-ops and disables form controls so the preview
        /// cannot navigate away from or submit data within the backoffice.
        /// </summary>
        /// <param name="markup">The rendered block markup.</param>
        /// <returns>The sanitized markup.</returns>
        string CleanUp(string markup);
    }
}
