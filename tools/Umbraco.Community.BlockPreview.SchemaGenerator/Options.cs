using CommandLine;

namespace Umbraco.Community.BlockPreview.SchemaGenerator
{
    internal class Options
    {
        [Option('o', "outputFile", Required = false,
        HelpText = "",
        Default = "..\\..\\..\\..\\Umbraco.Community.BlockPreview\\appsettings-schema.blockpreview.json")]
        public string OutputFile { get; set; } = "..\\..\\..\\..\\Umbraco.Community.BlockPreview\\appsettings-schema.blockpreview.json";
    }
}