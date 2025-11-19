using CommandLine;

namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class Options
    {
        [Option('o', "outputFile", Required = false,
        HelpText = "",
        Default = "..\\..\\..\\..\\..\\src\\Umbraco.Community.BlockPreview\\appsettings-schema.blockpreview.json")]
        public string OutputFile { get; set; } = "..\\..\\..\\..\\..\\src\\Umbraco.Community.BlockPreview\\appsettings-schema.blockpreview.json";
    }
}