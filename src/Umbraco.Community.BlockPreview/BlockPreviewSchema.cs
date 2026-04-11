namespace Umbraco.Community.BlockPreview;

internal sealed class BlockPreviewSchema
{
    /// <summary>
    /// Configuration for Block Preview.
    /// </summary>
    public required BlockPreviewDefinition BlockPreview { get; set; }

    public sealed class BlockPreviewDefinition
    {
        public required BlockTypeSettings BlockGrid { get; set; }

        public required BlockTypeSettings BlockList { get; set; }

        public required BlockTypeSettings RichText { get; set; }

        public required BlockTypeSettings SingleBlock { get; set; }
    }
}
