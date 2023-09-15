using Umbraco.Cms.Core.Manifest;

namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewManifestFilter : IManifestFilter
    {
        public void Filter(List<PackageManifest> manifests)
        {
            var assembly = typeof(BlockPreviewManifestFilter).Assembly;

            manifests.Add(new PackageManifest
            {
                PackageName = Constants.Configuration.PackageName,
                Version = assembly.GetName()?.Version?.ToString(3),
                AllowPackageTelemetry = true,
                Scripts = new string[]
                {
                    "/App_Plugins/Umbraco.Community.BlockPreview/js/controllers/block-preview.controller.js",
                    "/App_Plugins/Umbraco.Community.BlockPreview/js/directives/published-check.directive.js",
                    "/App_Plugins/Umbraco.Community.BlockPreview/js/directives/bind-compile.directive.js",
                    "/App_Plugins/Umbraco.Community.BlockPreview/js/resources/preview.resource.js"
                }
            });
        }
    }
}
