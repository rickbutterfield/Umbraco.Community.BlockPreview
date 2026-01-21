namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
  internal class AppSettings
  {
    public BlockPreviewDefinition BlockPreview { get; set; }

    internal class BlockPreviewDefinition
    {
      public BlockTypeSettings BlockGrid { get; set; }
      public BlockTypeSettings BlockList { get; set; }
      public BlockTypeSettings RichText { get; set; }

      internal class BlockTypeSettings
      {
        public bool Enabled { get; set; } = false;
        public List<string> ViewLocations { get; set; } = [];
        public List<string> ContentTypes { get; set; } = [];
        public List<string> IgnoredContentTypes { get; set; } = [];
        [Obsolete("Use Stylesheets instead to specify one or more stylesheets.")]
        public string Stylesheet { get; set; }
        public List<string> Stylesheets { get; set; } = [];
      }
    }

  }
}
