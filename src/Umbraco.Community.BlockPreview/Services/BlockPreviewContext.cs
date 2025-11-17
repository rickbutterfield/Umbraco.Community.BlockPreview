using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview.Services
{
    public class BlockPreviewContext
    {
        internal BlockPreviewContext(
            ControllerContext controllerContext,
            IPublishedContent content,
            string alias,
            BlockType blockType,
            int? blockIndex = null,
            BlockGridConfiguration.BlockGridBlockConfiguration? blockGridBlockConfig = null)
        {
            ControllerContext = controllerContext;
            Content = content;
            ContentAlias = alias;
            BlockType = blockType;
            BlockIndex = blockIndex;
            BlockGridBlockConfig = blockGridBlockConfig;
        }

        public ControllerContext ControllerContext { get; set; }
        public IPublishedContent Content { get; set; }
        public string ContentAlias { get; set; }
        public BlockType BlockType { get; set; }
        public ViewDataDictionary? ViewData { get; set; }
        public int? BlockIndex { get; }
        public BlockGridConfiguration.BlockGridBlockConfiguration? BlockGridBlockConfig { get; set; }
    }
}