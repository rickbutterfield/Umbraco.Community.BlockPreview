using NJsonSchema.Generation;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class BlockPreviewSchemaGenerator
    {
        private readonly JsonSchemaGenerator _schemaGenerator;

        public BlockPreviewSchemaGenerator()
            => _schemaGenerator = new JsonSchemaGenerator(new BlockPreviewSchemaGeneratorSettings());

        public string Generate()
        {
            var blockPreviewSchema = GenerateBlockPreviewSchema();
            return blockPreviewSchema.ToString();
        }

        private JsonObject GenerateBlockPreviewSchema()
        {
            var schema = _schemaGenerator.Generate(typeof(AppSettings));
            return JsonSerializer.Deserialize<JsonObject>(schema.ToJson());
        }
    }

    internal class BlockPreviewSchemaGeneratorSettings : SystemTextJsonSchemaGeneratorSettings
    {
        public BlockPreviewSchemaGeneratorSettings()
        {
            AlwaysAllowAdditionalObjectProperties = true;
            SerializerOptions = new JsonSerializerOptions();
            DefaultReferenceTypeNullHandling = ReferenceTypeNullHandling.NotNull;
            SchemaNameGenerator = new NamespacePrefixedSchemaNameGenerator();
            SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            IgnoreObsoleteProperties = true;
            GenerateExamples = true;
        }
    }

    internal class NamespacePrefixedSchemaNameGenerator : DefaultSchemaNameGenerator
    {
        public override string Generate(Type type) => type.Namespace.Replace(".", string.Empty) + base.Generate(type);
    }
}
