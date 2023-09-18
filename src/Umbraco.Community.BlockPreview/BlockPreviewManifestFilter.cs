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
                    $"/{Constants.Configuration.AppPluginsRoot}/js/controllers/block-preview.controller.js",
                    $"/{Constants.Configuration.AppPluginsRoot}/js/directives/published-check.directive.js",
                    $"/{Constants.Configuration.AppPluginsRoot}/js/directives/bind-compile.directive.js",
                    $"/{Constants.Configuration.AppPluginsRoot}/js/resources/preview.resource.js"
                }
            });
        }
    }
}
