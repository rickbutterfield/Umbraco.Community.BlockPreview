namespace Umbraco.Community.BlockPreview
{
    public static partial class Constants
    {
        public static partial class DefaultViewLocations
        {
            public static string BlockGrid => "/Views/Partials/blockgrid/Components/{0}.cshtml";
            public static string BlockList => "/Views/Partials/blocklist/Components/{0}.cshtml";
            public static string RichText => "/Views/Partials/richtext/Components/{0}.cshtml";
        }

        public static partial class Configuration
        {
            public static string PackageName => "Umbraco.Community.BlockPreview";
            public static string AppSettingsRoot => "BlockPreview";
            public static string AppPluginsRoot => $"App_Plugins/{PackageName}";
        }

        public static partial class ErrorMessages
        {
            public static string ErrorTemplate = "<div class=\"preview-alert preview-alert-error\">{0}</div>";

            public static string WarningTemplate = "<div class=\"preview-alert preview-alert-warning\">{0}</div>";

            public static string NoGeneratedModels = "Generated model(s) could not be found. Please try regenerating models and restarting the application.";

            public static string InvalidBlockData = "The block data is invalid.";

            public static string InvalidContentKey = "The content key is invalid.";

            public static string InvalidContentData = "The content data is invalid.";

            public static string InvalidBlockInstance = "The block instance is invalid.";

            public static string InvalidDocumentType = "The document type is invalid.";

            public static string InvalidPropertyType = "The property type is invalid.";

            public static string InvalidDataType = "The data type is invalid.";

            public static string InvalidBlockGridConfiguration = "The block grid configuration is invalid.";

            public static string InvalidMatchingBlockGridConfiguration = "A matching block grid configuration could not be found";

            public static string ViewNotFound = "The view <code>{0}.cshtml</code> could not be found. Searched the following locations: <pre>{1}</pre>";
        }
    }
}