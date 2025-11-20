using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Helpers
{
    /// <summary>
    /// Wrapper for view component helper.
    /// </summary>
    /// <typeparam name="T">The type of view component helper.</typeparam>
    [ExcludeFromCodeCoverage(Justification = $"This is a wrapper class to avoid setting up a {nameof(DefaultViewComponentHelper)}")]
    public sealed class ViewComponentHelperWrapper<T> : IViewComponentHelperWrapper where T : IViewComponentHelper, IViewContextAware
    {
        private readonly T _helper;

        /// <summary>
        /// Initializes a new instance of the <see cref="ViewComponentHelperWrapper{T}"/> class.
        /// </summary>
        /// <param name="helper">The view component helper.</param>
        public ViewComponentHelperWrapper(T helper)
        {
            _helper = helper;
        }

        /// <summary>
        /// Invokes a view component asynchronously by name.
        /// </summary>
        /// <param name="name">The view component name.</param>
        /// <param name="arguments">The arguments.</param>
        /// <returns>The HTML content.</returns>
        public Task<IHtmlContent> InvokeAsync(string name, object? arguments) => _helper.InvokeAsync(name, arguments);

        /// <summary>
        /// Invokes a view component asynchronously by type.
        /// </summary>
        /// <param name="componentType">The view component type.</param>
        /// <param name="arguments">The arguments.</param>
        /// <returns>The HTML content.</returns>
        public Task<IHtmlContent> InvokeAsync(Type componentType, object? arguments) => _helper.InvokeAsync(componentType, arguments);

        /// <summary>
        /// Contextualizes the view component helper with a view context.
        /// </summary>
        /// <param name="viewContext">The view context.</param>
        public void Contextualize(ViewContext viewContext) => _helper.Contextualize(viewContext);
    }
}
