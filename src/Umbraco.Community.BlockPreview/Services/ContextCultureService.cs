using System.Globalization;
using System.Threading;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Services
{
    public class ContextCultureService
    {
        private readonly IVariationContextAccessor _variationContextAccessor;

        public ContextCultureService(IVariationContextAccessor variationContextAccessor)
        {
            _variationContextAccessor = variationContextAccessor;
        }

        public void SetCulture(string culture)
        {
            _variationContextAccessor.VariationContext = new VariationContext(culture);

            var cultureInfo = new CultureInfo(culture);
            Thread.CurrentThread.CurrentCulture = cultureInfo;
            Thread.CurrentThread.CurrentUICulture = cultureInfo;
        }
    }
}
