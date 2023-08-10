using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Umbraco.Community.BlockPreview.ViewEngines
{
    /// <summary>
    ///     Expands the default view locations
    /// </summary>
    public class BlockViewEngineOptionsSetup : IConfigureOptions<RazorViewEngineOptions>
    {
        private readonly BlockPreviewOptions _options;

        public BlockViewEngineOptionsSetup(IOptions<BlockPreviewOptions> options)
        {
            _options = options.Value;
        }


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
                ViewLocationExpanderContext context, IEnumerable<string> viewLocations)
            {
                return _options.ViewLocations.GetAll().Concat(viewLocations);
            }

            // not a dynamic expander
            public void PopulateValues(ViewLocationExpanderContext context)
            {
            }
        }
    }
}
