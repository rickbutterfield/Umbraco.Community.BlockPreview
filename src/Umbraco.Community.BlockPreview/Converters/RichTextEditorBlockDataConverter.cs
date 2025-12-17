using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.Models.Blocks;

namespace Umbraco.Community.BlockPreview.Converters
{
    public class RichTextEditorBlockDataConverter : BlockEditorDataConverter
    {
        public RichTextEditorBlockDataConverter()
            : base(Cms.Core.Constants.PropertyEditors.Aliases.TinyMce)
        {
        }

        protected override IEnumerable<ContentAndSettingsReference>? GetBlockReferences(JToken jsonLayout)
        {
            IEnumerable<RichTextBlockLayoutItem>? blockListLayout = jsonLayout.ToObject<IEnumerable<RichTextBlockLayoutItem>>();
            return blockListLayout?.Select(x => new ContentAndSettingsReference(x.ContentUdi, x.SettingsUdi)).ToList();
        }
    }
}