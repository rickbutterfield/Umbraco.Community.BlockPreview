using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Cache.PropertyEditors;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Infrastructure.Serialization;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Models;
using static Umbraco.Cms.Core.Constants;

namespace Umbraco.Community.BlockPreview.Services
{
    /// <summary>
    /// Service for converting and formatting block data.
    /// </summary>
    public class BlockDataConverter : IBlockDataConverter
    {
        private readonly BlockEditorConverter _blockEditorConverter;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly ILogger<BlockDataConverter> _logger;
        private readonly BlockEditorValues<BlockGridValue, BlockGridLayoutItem> _blockGridEditorValues;
        private readonly BlockEditorValues<BlockListValue, BlockListLayoutItem> _blockListEditorValues;
        private readonly BlockEditorValues<RichTextBlockValue, RichTextBlockLayoutItem> _richTextBlockEditorValues;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        /// <summary>
        /// Initializes a new instance of the <see cref="BlockDataConverter"/> class.
        /// </summary>
        /// <param name="blockEditorConverter">The block editor converter.</param>
        /// <param name="jsonSerializer">The JSON serializer.</param>
        /// <param name="elementTypeCache">The block editor element type cache.</param>
        /// <param name="logger">The logger.</param>
        public BlockDataConverter(
            BlockEditorConverter blockEditorConverter,
            IJsonSerializer jsonSerializer,
            IBlockEditorElementTypeCache elementTypeCache,
            ILogger<BlockDataConverter> logger)
        {
            _blockEditorConverter = blockEditorConverter;
            _jsonSerializer = jsonSerializer;
            _logger = logger;

            _blockGridEditorValues = new BlockEditorValues<BlockGridValue, BlockGridLayoutItem>(
                new BlockGridEditorDataConverter(jsonSerializer), elementTypeCache, logger);
            _blockListEditorValues = new BlockEditorValues<BlockListValue, BlockListLayoutItem>(
                new BlockListEditorDataConverter(jsonSerializer), elementTypeCache, logger);
            _richTextBlockEditorValues = new BlockEditorValues<RichTextBlockValue, RichTextBlockLayoutItem>(
                new RichTextEditorBlockDataConverter(jsonSerializer), elementTypeCache, logger);

            _jsonSerializerOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters =
                {
                    new JsonStringEnumConverter(),
                    new JsonUdiConverter(),
                    new JsonUdiRangeConverter(),
                    new JsonObjectConverter(),
                    new JsonBlockValueConverter()
                }
            };
        }

        /// <inheritdoc/>
        public BlockEditorData<BlockGridValue, BlockGridLayoutItem>? DeserializeBlockGrid(string? blockData)
        {
            return _blockGridEditorValues.DeserializeAndClean(blockData);
        }

        /// <inheritdoc/>
        public BlockEditorData<BlockListValue, BlockListLayoutItem>? DeserializeBlockList(string? blockData)
        {
            return _blockListEditorValues.DeserializeAndClean(blockData);
        }

        /// <inheritdoc/>
        public BlockEditorData<RichTextBlockValue, RichTextBlockLayoutItem>? DeserializeRichText(string? blockData)
        {
            return _richTextBlockEditorValues.DeserializeAndClean(blockData);
        }

        /// <inheritdoc/>
        public IPublishedElement ConvertToElement(BlockItemData data, IPublishedElement owner)
        {
            if (data != null)
            {
                for (int i = 0; i < data.Values.Count(); i++)
                {
                    var property = data.Values.ElementAt(i);
                    var value = property.Value;
                    string? propertyAsString = value?.ToString();

                    if (property.EditorAlias == PropertyEditors.Aliases.RichText)
                    {
                        if (RichTextPropertyEditorHelper.TryParseRichTextEditorValue(value, _jsonSerializer, _logger, out RichTextEditorValue? richTextEditorValue))
                        {
                            var blockValue = _richTextBlockEditorValues.DeserializeAndClean(_jsonSerializer.Serialize(richTextEditorValue.Blocks));
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                richTextEditorValue.Blocks = blockValue.BlockValue;

                                property.Value = JsonSerializer.Serialize(richTextEditorValue, _jsonSerializerOptions);
                            }
                        }
                    }
                    if (property.EditorAlias == PropertyEditors.Aliases.BlockGrid)
                    {
                        var blockValue = _blockGridEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }
                    if (property.EditorAlias == PropertyEditors.Aliases.BlockList)
                    {
                        var blockValue = _blockListEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            property.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }
                }
            }

            var element = _blockEditorConverter.ConvertToElement(owner, data!, PropertyCacheLevel.None, preview: true);
            if (element == null)
                throw new InvalidOperationException($"Unable to find Element {data?.ContentTypeAlias}");

            return element;
        }

        /// <inheritdoc/>
        public void FormatBlockData(List<BlockItemData>? blockData)
        {
            if (blockData == null || blockData.Count == 0)
                return;

            foreach (var contentData in blockData)
            {
                foreach (var propertyData in contentData.Values)
                {
                    if (propertyData.EditorAlias == PropertyEditors.Aliases.ContentPicker)
                    {
                        if (Guid.TryParse(propertyData.Value?.ToString(), out Guid parsedGuid))
                        {
                            propertyData.Value = StringUdi.Create("document", parsedGuid).UriValue.ToString();
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.RichText)
                    {
                        if (RichTextPropertyEditorHelper.TryParseRichTextEditorValue(propertyData.Value, _jsonSerializer, _logger, out RichTextEditorValue? richTextEditorValue))
                        {
                            var blockValue = _richTextBlockEditorValues.DeserializeAndClean(_jsonSerializer.Serialize(richTextEditorValue.Blocks));
                            if (blockValue != null)
                            {
                                FormatBlockData(blockValue.BlockValue.ContentData);
                                FormatBlockData(blockValue.BlockValue.SettingsData);

                                richTextEditorValue.Blocks = blockValue.BlockValue;

                                propertyData.Value = JsonSerializer.Serialize(richTextEditorValue, _jsonSerializerOptions);

                                propertyData.Value = propertyData.Value.ToString()?.Replace("\"Layout\"", "\"layout\"");
                            }
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.BlockGrid)
                    {
                        string? propertyAsString = propertyData.Value?.ToString();
                        var blockValue = _blockGridEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            propertyData.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }

                    else if (propertyData.EditorAlias == PropertyEditors.Aliases.BlockList)
                    {
                        string? propertyAsString = propertyData.Value?.ToString();
                        var blockValue = _blockListEditorValues.DeserializeAndClean(propertyAsString);
                        if (blockValue != null)
                        {
                            FormatBlockData(blockValue.BlockValue.ContentData);
                            FormatBlockData(blockValue.BlockValue.SettingsData);
                            propertyData.Value = JsonSerializer.Serialize(blockValue.BlockValue, _jsonSerializerOptions);
                        }
                    }

                    else if (propertyData.Value is JsonObject jsonObject)
                    {
                        propertyData.Value = JsonSerializer.Serialize(jsonObject, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is JsonArray jsonArray)
                    {
                        if (propertyData.EditorAlias == PropertyEditors.Aliases.MultiNodeTreePicker)
                        {
                            List<EditorEntityReference>? convertedReferences = JsonSerializer.Deserialize<List<EditorEntityReference>>(propertyData.Value.ToString()!);
                            IEnumerable<Udi>? convertedData = convertedReferences?.Select(x => StringUdi.Create(x.Type, x.Unique));
                            string? stringifiedData = string.Join(",", convertedData!);
                            propertyData.Value = stringifiedData;
                        }

                        else propertyData.Value = JsonSerializer.Serialize(jsonArray, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is List<string> list)
                    {
                        propertyData.Value = JsonSerializer.Serialize(list, _jsonSerializerOptions);
                    }

                    else if (propertyData.Value is string str)
                    {
                        propertyData.Value = str;
                    }
                }
            }
        }
    }
}
