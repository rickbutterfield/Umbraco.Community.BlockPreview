using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Umbraco.Community.BlockPreview.Configuration
{
    public class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
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
