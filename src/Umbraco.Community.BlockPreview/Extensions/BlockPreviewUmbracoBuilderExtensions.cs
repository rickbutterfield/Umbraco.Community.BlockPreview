using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Umbraco.Community.BlockPreview.Extensions
{
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBlockPreviewOptions(this IUmbracoBuilder builder,
            Action<OptionsBuilder<BlockPreviewOptions>>? configure = null)
        {
            var optionsBuilder = builder.Services.AddOptions<BlockPreviewOptions>()
                .Bind(builder.Config.GetSection(Constants.Configuration.AppSettingsRoot))
                .PostConfigure(x =>
                {
                    x.ViewLocations.BlockGrid.Add(Constants.DefaultViewLocations.BlockGrid);
                    x.ViewLocations.BlockList.Add(Constants.DefaultViewLocations.BlockList);
                })
                .ValidateDataAnnotations()
                .ValidateOnStart();

            configure?.Invoke(optionsBuilder);

            return builder;
        }
    }
}