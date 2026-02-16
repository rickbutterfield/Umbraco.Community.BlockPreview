using Umbraco.Cms.Core.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;

namespace Umbraco.Community.BlockPreview.Extensions
{
    /// <summary>
    /// Extension methods for configuring Block Preview in an Umbraco application.
    /// </summary>
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        /// <summary>
        /// Adds Block Preview services to the Umbraco builder.
        /// </summary>
        /// <param name="builder">The Umbraco builder.</param>
        /// <returns>The Umbraco builder.</returns>
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder)
            => builder.AddInternal();

        /// <summary>
        /// Adds Block Preview services to the Umbraco builder with custom configuration.
        /// </summary>
        /// <param name="builder">The Umbraco builder.</param>
        /// <param name="configure">The configuration action.</param>
        /// <returns>The Umbraco builder.</returns>
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder, Action<BlockPreviewOptions> configure)
            => builder.AddInternal(optionsBuilder => optionsBuilder.Configure(configure));

        /// <summary>
        /// Internal method for adding Block Preview services.
        /// </summary>
        /// <param name="builder">The Umbraco builder.</param>
        /// <param name="configure">The optional configuration action.</param>
        /// <returns>The Umbraco builder.</returns>
        internal static IUmbracoBuilder AddInternal(this IUmbracoBuilder builder,
            Action<OptionsBuilder<BlockPreviewOptions>>? configure = null)
        {
            ArgumentNullException.ThrowIfNull(builder);

            var optionsBuilder = builder.Services.AddOptions<BlockPreviewOptions>()
                .BindConfiguration(Constants.Configuration.AppSettingsRoot)
                .PostConfigure(x =>
                {
                    if (x.BlockGrid?.ViewLocations != null)
                        x.BlockGrid.ViewLocations.Add(Constants.DefaultViewLocations.BlockGrid);

                    if (x.BlockList?.ViewLocations != null)
                        x.BlockList.ViewLocations.Add(Constants.DefaultViewLocations.BlockList);

                    if (x.RichText?.ViewLocations != null)
                        x.RichText.ViewLocations.Add(Constants.DefaultViewLocations.RichText);
                })
                .ValidateDataAnnotations();

            configure?.Invoke(optionsBuilder);

            return builder;
        }
    }
}