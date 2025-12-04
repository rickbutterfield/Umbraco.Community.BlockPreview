using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    /// <summary>
    /// Wrapper interface for view component helper.
    /// </summary>
    public interface IViewComponentHelperWrapper : IViewComponentHelper, IViewContextAware
    {
    }
}
