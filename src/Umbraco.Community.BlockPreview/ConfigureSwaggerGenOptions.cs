using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Umbraco.Community.BlockPreview
{
    public class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc(
                "blockpreview",
                new OpenApiInfo
                {
                    Title = "BlockPreview API",
                    Version = "Latest",
                    Description = "Umbraco.Community.BlockPreview"
                });
        }
    }
}
