using System.Text.Json.Serialization;

namespace Umbraco.Community.BlockPreview.Models
{
    /// <summary>
    /// Represents a reference to an editor entity.
    /// </summary>
    public class EditorEntityReference
    {
        /// <summary>
        /// Gets or sets the entity type.
        /// </summary>
        [JsonPropertyName("type")]
        public required string Type { get; set; }

        /// <summary>
        /// Gets or sets the unique identifier.
        /// </summary>
        [JsonPropertyName("unique")]
        public required Guid Unique { get; set; }
    }
}
