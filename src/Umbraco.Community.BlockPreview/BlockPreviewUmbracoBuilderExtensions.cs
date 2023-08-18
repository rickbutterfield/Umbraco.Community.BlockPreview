using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.BlockPreview.NotificationHandlers;
using Umbraco.Community.BlockPreview.ViewEngines;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Helpers;
using Umbraco.Community.BlockPreview.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Umbraco.Community.BlockPreview
{
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder, Action<OptionsBuilder<BlockPreviewOptions>> configure = null)
        {
            builder.AddBlockPreviewOptions(configure);

            builder.AddNotificationHandler<ServerVariablesParsingNotification, ServerVariablesParsingNotificationHandler>();

            builder.Services.AddScoped<IViewComponentHelperWrapper>(sp =>
            {
                if (sp.GetRequiredService<IViewComponentHelper>() is DefaultViewComponentHelper helper)
                {
                    return new ViewComponentHelperWrapper<DefaultViewComponentHelper>(helper);
                }

                throw new InvalidOperationException($"Expected {nameof(DefaultViewComponentHelper)} when resolving {nameof(IViewComponentHelperWrapper)}");
            });

            builder.Services.AddScoped<IBackOfficePreviewService, BackOfficeListPreviewService>();
            builder.Services.AddScoped<IBackOfficeListPreviewService, BackOfficeListPreviewService>();
            builder.Services.AddScoped<IBackOfficeGridPreviewService, BackOfficeGridPreviewService>();
            builder.Services.AddScoped<ContextCultureService>();

            builder.Services.ConfigureOptions<BlockViewEngineOptionsSetup>();
            return builder;
        }

        private static IUmbracoBuilder AddBlockPreviewOptions(this IUmbracoBuilder builder,
            Action<OptionsBuilder<BlockPreviewOptions>> configure = null)
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