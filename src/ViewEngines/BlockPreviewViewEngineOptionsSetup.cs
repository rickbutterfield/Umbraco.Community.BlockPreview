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
        public void Configure(RazorViewEngineOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            options.ViewLocationExpanders.Add(new BlockViewLocationExpander());
        }

        private class BlockViewLocationExpander : IViewLocationExpander
        {
            public IEnumerable<string> ExpandViewLocations(
                ViewLocationExpanderContext context, IEnumerable<string> viewLocations)
            {
                string[] blockViewLocations =
                {
                    Constants.ViewLocations.BlockGrid,
                    Constants.ViewLocations.BlockList
                };

                viewLocations = blockViewLocations.Concat(viewLocations);

                return viewLocations;
            }

            // not a dynamic expander
            public void PopulateValues(ViewLocationExpanderContext context)
            {
            }
        }
    }
}
