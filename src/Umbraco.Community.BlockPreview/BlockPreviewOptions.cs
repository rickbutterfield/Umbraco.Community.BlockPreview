namespace Umbraco.Community.BlockPreview
{
    public class BlockPreviewOptions
    {
        public BlockPreviewOptions()
        {
            ViewLocations = new ViewLocations();
        }

        public ViewLocations ViewLocations { get; set; }
    }

    public class ViewLocations
    {
        public ViewLocations()
        {
            BlockList = new List<string>();
            BlockGrid = new List<string>();
        }

        public List<string> BlockList { get; set; }

        public List<string> BlockGrid { get; set; }

        public IEnumerable<string> GetAll() => BlockList.Concat(BlockGrid);
    }
}