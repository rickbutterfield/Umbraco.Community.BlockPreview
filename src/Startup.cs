using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Community.BlockPreview.Helpers;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.NotificationHandlers;
using Umbraco.Community.BlockPreview.Services;
using System;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace Umbraco.Community.BlockPreview
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
