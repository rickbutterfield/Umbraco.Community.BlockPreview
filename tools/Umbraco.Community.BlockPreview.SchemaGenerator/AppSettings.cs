using System.Collections.Generic;

namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class AppSettings
    {
        public BlockPreviewDefinition BlockPreview { get; set; }

        internal class BlockPreviewDefinition
        {
            public ViewLocations ViewLocations { get; set; }
        }
    }

    public class ViewLocations
    {
        public List<string> BlockList { get; set; }
        public List<string> BlockGrid { get; set; }
        public List<string> RichText { get; set; }
    }
}
