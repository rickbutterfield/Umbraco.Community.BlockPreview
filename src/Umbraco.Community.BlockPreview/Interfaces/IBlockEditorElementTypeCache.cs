using Umbraco.Cms.Core.Models;

namespace Umbraco.Community.BlockPreview.Interfaces
{
    public interface IBlockEditorElementTypeCache
    {
        IEnumerable<IContentType> GetAll(IEnumerable<Guid> keys);
    }
}
