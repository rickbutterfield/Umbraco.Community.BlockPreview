using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc;

namespace Our.Umbraco.BlockPreview.Interfaces
{
    public interface IViewComponentHelperWrapper : IViewComponentHelper, IViewContextAware
    {
    }
}
