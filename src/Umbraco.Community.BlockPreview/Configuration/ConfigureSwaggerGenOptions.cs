using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Umbraco.Community.BlockPreview.Configuration
{
    /// <summary>
    /// Configures Swagger generation options for the Block Preview API.
    /// </summary>
    public class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        /// <summary>
        /// Configures the specified options.
        /// </summary>
        /// <param name="options">The options to configure.</param>
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc(
              Constants.Configuration.ApiName,
              new OpenApiInfo
              {
                  Title = "BlockPreview Management API",
                  Version = "Latest",
              });
        }
    }
}
