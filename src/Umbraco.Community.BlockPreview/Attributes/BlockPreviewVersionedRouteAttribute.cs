using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Web.Common.Routing;

namespace Umbraco.Community.BlockPreview.Attributes
{
    /// <summary>
    /// Route attribute for versioned Block Preview API endpoints.
    /// </summary>
    public class BlockPreviewVersionedRouteAttribute : BackOfficeRouteAttribute
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="BlockPreviewVersionedRouteAttribute"/> class.
        /// </summary>
        /// <param name="template">The route template.</param>
        public BlockPreviewVersionedRouteAttribute(string template)
            : base($"{Constants.Configuration.ApiPath}/v{{version:apiVersion}}/{template.TrimStart('/')}")
        { }
    }
}
