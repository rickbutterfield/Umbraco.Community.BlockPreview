using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Web.Common.Routing;

namespace Umbraco.Community.BlockPreview.Attributes
{
    public class BlockPreviewVersionedRouteAttribute : BackOfficeRouteAttribute
    {
        public BlockPreviewVersionedRouteAttribute(string template)
            : base($"{Constants.Configuration.ApiPath}/v{{version:apiVersion}}/{template.TrimStart('/')}")
        { }
    }
}
