using Umbraco.Community.BlockPreview.Enums;

namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public BlockWithStylesheetSettings BlockGrid { get; set; }
        public BlockWithStylesheetSettings BlockList { get; set; }
        public BlockWithStylesheetSettings RichText { get; set; }

        public List<string>? GetViewLocations(BlockType blockType)
        {
            var locations = new List<string>();

            if (blockType == BlockType.BlockGrid)
            {
                if (BlockGrid?.ViewLocations?.Any() == true)
                    locations.AddRange(BlockGrid.ViewLocations);

                locations.Add(Constants.DefaultViewLocations.BlockGrid);
            }

            if (blockType == BlockType.BlockList)
            {
                if (BlockList?.ViewLocations?.Any() == true)
                    locations.AddRange(BlockList.ViewLocations);
                
                locations.Add(Constants.DefaultViewLocations.BlockList);
            }

            if (blockType == BlockType.RichText)
            {
                if (RichText?.ViewLocations?.Any() == true)
                    locations.AddRange(RichText.ViewLocations);

                locations.Add(Constants.DefaultViewLocations.RichText);
            }

            locations = locations.Distinct().ToList();

            return locations;
        }

        public List<string>? GetAllViewLocations()
        {
            var locations = new List<string>();

            var blockGridLocations = GetViewLocations(BlockType.BlockGrid);
            if (blockGridLocations?.Any() == true)
                locations.AddRange(blockGridLocations);

            var blockListLocations = GetViewLocations(BlockType.BlockList);
            if (blockListLocations?.Any() == true)
                locations.AddRange(blockListLocations);

            var richTextLocations = GetViewLocations(BlockType.RichText);
            if (richTextLocations?.Any() == true)
                locations.AddRange(richTextLocations);

            return locations;
        }

        public BlockPreviewOptions()
        {
            BlockGrid = new();
            BlockList = new();
            RichText = new();
        }
    }

    public class BlockTypeSettings
    {
        public bool Enabled { get; set; } = false;
        public List<string>? ViewLocations { get; set; } = [];
        public List<string>? ContentTypes { get; set; } = [];
    }

    public class BlockWithStylesheetSettings : BlockTypeSettings
    { 
        public string? Stylesheet { get; set; }
    }
}