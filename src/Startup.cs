using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.BlockPreview.Helpers;
using Our.Umbraco.BlockPreview.Interfaces;
using Our.Umbraco.BlockPreview.NotificationHandlers;
using Our.Umbraco.BlockPreview.Services;
using System;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace Our.Umbraco.BlockPreview
{
    public class Startup : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder
                .AddNotificationHandler<ServerVariablesParsingNotification,
                    ServerVariablesParsingNotificationHandler>();

            builder.Services.AddScoped<IViewComponentHelperWrapper>(sp =>
            {
                if (sp.GetRequiredService<IViewComponentHelper>() is DefaultViewComponentHelper helper)
                {
                    return new ViewComponentHelperWrapper<DefaultViewComponentHelper>(helper);
                }

                throw new InvalidOperationException($"Expected {nameof(DefaultViewComponentHelper)} when resolving {nameof(IViewComponentHelperWrapper)}");
            });

            builder.Services.AddScoped<IBackOfficePreviewService, BackOfficePreviewService>();
        }
    }
}
