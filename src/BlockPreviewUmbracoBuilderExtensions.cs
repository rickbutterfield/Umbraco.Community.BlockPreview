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

namespace Umbraco.Community.BlockPreview
{
    public static class BlockPreviewUmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddBlockPreview(this IUmbracoBuilder builder)
        {
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

            builder.Services.ConfigureOptions<BlockViewEngineOptionsSetup>();
            return builder;
        }
    }
}
