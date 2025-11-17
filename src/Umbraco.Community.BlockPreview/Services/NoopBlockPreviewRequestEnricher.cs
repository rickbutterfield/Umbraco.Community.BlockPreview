using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Community.BlockPreview.Interfaces;

namespace Umbraco.Community.BlockPreview.Services
{
    public class NoopBlockPreviewRequestEnricher : IBlockPreviewRequestEnricher
    {
        public Task EnrichAsync(
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null) => Task.CompletedTask;
    }
}
