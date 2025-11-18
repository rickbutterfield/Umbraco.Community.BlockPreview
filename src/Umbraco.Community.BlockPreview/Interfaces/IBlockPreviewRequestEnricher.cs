using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBlockPreviewRequestEnricher
    {
        Task EnrichAsync(
            HttpContext httpContext,
            IPublishedContent? content,
            string? blockEditorAlias = null,
            string? contentElementAlias = null,
            string? contentUdi = null,
            string? settingsUdi = null,
            int? blockIndex = null);
    }
}
