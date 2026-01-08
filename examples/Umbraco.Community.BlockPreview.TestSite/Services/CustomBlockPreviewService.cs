using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Community.BlockPreview.Enums;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Services;

namespace Umbraco.Community.BlockPreview.TestSite.Services
{
    public class CustomBlockPreviewService : BlockPreviewService
    {
        private readonly IRazorViewEngine _razorViewEngine;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public CustomBlockPreviewService(
            ILogger<BlockPreviewService> logger,
            ITempDataProvider tempDataProvider,
            IViewComponentHelperWrapper viewComponentHelperWrapper,
            IRazorViewEngine razorViewEngine,
            ITypeFinder typeFinder,
            BlockEditorConverter blockEditorConverter,
            IViewComponentSelector viewComponentSelector,
            IPublishedValueFallback publishedValueFallback,
            IOptions<BlockPreviewOptions> options,
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            AppCaches appCaches,
            IWebHostEnvironment webHostEnvironment,
            Interfaces.IBlockEditorElementTypeCache elementTypeCache,
            IJsonSerializer jsonSerializer)
        : base(logger, tempDataProvider, viewComponentHelperWrapper, razorViewEngine, typeFinder, blockEditorConverter, viewComponentSelector, publishedValueFallback, options, contentTypeService, dataTypeService, appCaches, webHostEnvironment, elementTypeCache, jsonSerializer)
        {
            _razorViewEngine = razorViewEngine;
            _webHostEnvironment = webHostEnvironment;
        }

        /// <inheritdoc/>
        protected override ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockPreviewContext context)
        {
            return base.CreateViewData(typedBlockInstance, context);
        }

        /// <inheritdoc/>
        protected override ViewEngineResult? GetViewResult(BlockPreviewContext context)
        {
            if (context.ControllerContext.HttpContext.Items.TryGetValue("theme", out var themeObj) && themeObj is string theme)
            {
                string blockType;
                switch (context.BlockType)
                {
                    case BlockType.BlockGrid:
                        blockType = "Blockgrid";
                        break;
                    case BlockType.BlockList:
                        blockType = "Blocklist";
                        break;
                    case BlockType.RichText:
                        blockType = "Richtext";
                        break;
                    default:
                        return base.GetViewResult(context);
                }

                string themedPath = $"~/Views/Themes/{theme}/{blockType}/Components/{context.ContentAlias}.cshtml";
                return _razorViewEngine.GetView("", themedPath, false);
            }
            return base.GetViewResult(context);
        }
    }
}
