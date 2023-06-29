using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IViewComponentHelperWrapper : IViewComponentHelper, IViewContextAware
    {
    }
}
