using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Options;

namespace Umbraco.Community.BlockPreview.ViewEngines
{
    /// <summary>
    /// Expands the default view locations for Block Preview.
    /// </summary>
    public class BlockViewEngineOptionsSetup : IConfigureOptions<RazorViewEngineOptions>
    {
        private readonly BlockPreviewOptions _options;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockViewEngineOptionsSetup"/> class.
        /// </summary>
        /// <param name="options">The block preview options.</param>
        public BlockViewEngineOptionsSetup(IOptions<BlockPreviewOptions> options)
        {
            _options = options.Value;
        }

        /// <summary>
        /// Configures the Razor view engine options.
        /// </summary>
        /// <param name="options">The options to configure.</param>
        public void Configure(RazorViewEngineOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            options.ViewLocationExpanders.Add(new BlockViewLocationExpander(_options));
        }

        private class BlockViewLocationExpander : IViewLocationExpander
        {
            private readonly BlockPreviewOptions _options;

            public BlockViewLocationExpander(BlockPreviewOptions options)
            {
                _options = options;
            }

            public IEnumerable<string> ExpandViewLocations(
                ViewLocationExpanderContext context,
                IEnumerable<string> viewLocations)
            {
                var customViewLocations = _options.GetAllViewLocations();
                return viewLocations.Concat(customViewLocations!);
            }

            // not a dynamic expander
            public void PopulateValues(ViewLocationExpanderContext context)
            {
            }
        }
    }
}
