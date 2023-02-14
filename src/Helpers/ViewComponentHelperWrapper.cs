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
    [ExcludeFromCodeCoverage(Justification = $"This is a wrapper class to avoid setting up a {nameof(DefaultViewComponentHelper)}")]
    public sealed class ViewComponentHelperWrapper<T> : IViewComponentHelperWrapper where T : IViewComponentHelper, IViewContextAware
    {
        private readonly T _helper;

        public ViewComponentHelperWrapper(T helper)
        {
            _helper = helper;
        }

        public Task<IHtmlContent> InvokeAsync(string name, object? arguments) => _helper.InvokeAsync(name, arguments);

        public Task<IHtmlContent> InvokeAsync(Type componentType, object? arguments) => _helper.InvokeAsync(componentType, arguments);

        public void Contextualize(ViewContext viewContext) => _helper.Contextualize(viewContext);
    }
}
