namespace Umbraco.Community.BlockPreview
{
    /// <summary>
    /// Constants used throughout the Block Preview package.
    /// </summary>
    public static partial class Constants
    {
        /// <summary>
        /// Default view locations for different block types.
        /// </summary>
        public static partial class DefaultViewLocations
        {
            /// <summary>
            /// Default view location for Block Grid components.
            /// </summary>
            public const string BlockGrid = "/Views/Partials/blockgrid/Components/{0}.cshtml";
            
            /// <summary>
            /// Default view location for Block List components.
            /// </summary>
            public const string BlockList = "/Views/Partials/blocklist/Components/{0}.cshtml";
            
            /// <summary>
            /// Default view location for Rich Text components.
            /// </summary>
            public const string RichText = "/Views/Partials/richtext/Components/{0}.cshtml";
        }

        /// <summary>
        /// Configuration constants.
        /// </summary>
        public static partial class Configuration
        {
            /// <summary>
            /// The package name.
            /// </summary>
            public const string PackageName = "Umbraco.Community.BlockPreview";
            
            /// <summary>
            /// The app settings root key.
            /// </summary>
            public const string AppSettingsRoot = "BlockPreview";
            
            /// <summary>
            /// The API name.
            /// </summary>
            public const string ApiName = "block-preview";
            
            /// <summary>
            /// The API path.
            /// </summary>
            public const string ApiPath = "/block-preview/api";
            
            /// <summary>
            /// The App_Plugins root path.
            /// </summary>
            public const string AppPluginsRoot = $"App_Plugins/{PackageName}";
        }

        /// <summary>
        /// Error message templates.
        /// </summary>
        public static partial class ErrorMessages
        {
            /// <summary>
            /// Error message template for rendering errors.
            /// </summary>
            public static string RenderError = "<strong>Something went wrong rendering a preview.</strong><br/><pre>{0}</pre>";

            /// <summary>
            /// Error message for missing ModelsBuilder models.
            /// </summary>
            public static string ModelsBuilderError = "Strongly typed models must be generated and exist on disk for BlockPreview to work.";

            /// <summary>
            /// HTML template for error alerts.
            /// </summary>
            public static string ErrorTemplate = "<div class=\"preview-alert preview-alert-error\">{0}</div>";

            /// <summary>
            /// HTML template for warning alerts.
            /// </summary>
            public static string WarningTemplate = "<div class=\"preview-alert preview-alert-warning\">{0}</div>";

            /// <summary>
            /// Error message for missing generated models.
            /// </summary>
            public static string NoGeneratedModels = "Generated model(s) could not be found. Please try regenerating models and restarting the application.";

            /// <summary>
            /// Error message for invalid block data.
            /// </summary>
            public static string InvalidBlockData = "The block data is invalid.";

            /// <summary>
            /// Error message for invalid content key.
            /// </summary>
            public static string InvalidContentKey = "The content key is invalid.";

            /// <summary>
            /// Error message for invalid content data.
            /// </summary>
            public static string InvalidContentData = "The content data is invalid.";

            /// <summary>
            /// Error message for invalid block instance.
            /// </summary>
            public static string InvalidBlockInstance = "The block instance is invalid.";

            /// <summary>
            /// Error message for invalid document type.
            /// </summary>
            public static string InvalidDocumentType = "The document type is invalid.";

            /// <summary>
            /// Error message for invalid property type.
            /// </summary>
            public static string InvalidPropertyType = "The property type is invalid.";

            /// <summary>
            /// Error message for invalid data type.
            /// </summary>
            public static string InvalidDataType = "The data type is invalid.";

            /// <summary>
            /// Error message for invalid block grid configuration.
            /// </summary>
            public static string InvalidBlockGridConfiguration = "The block grid configuration is invalid.";

            /// <summary>
            /// Error message for missing matching block grid configuration.
            /// </summary>
            public static string InvalidMatchingBlockGridConfiguration = "A matching block grid configuration could not be found";

            /// <summary>
            /// Error message template for view not found.
            /// </summary>
            public static string ViewNotFound = "The view <code>{0}.cshtml</code> could not be found. Searched the following locations: <pre>{1}</pre>";

            /// <summary>
            /// Logger error message template.
            /// </summary>
            public static string LoggerError = "Error rendering preview for block {0}";
        }

        /// <summary>
        /// Cache key templates.
        /// </summary>
        public static partial class CacheKeys
        {
            /// <summary>
            /// Cache key template for content.
            /// </summary>
            public static string Content = "BlockPreview_Content_{0}";
            
            /// <summary>
            /// Cache key for generated models.
            /// </summary>
            public static string GeneratedModels = "BlockPreview_GeneratedModels";
            
            /// <summary>
            /// Cache key template for block type.
            /// </summary>
            public static string BlockType = "BlockPreview_BlockType_{0}";
            
            /// <summary>
            /// Cache key template for content type.
            /// </summary>
            public static string ContentType = "BlockPreview_ContentType_{0}";
            
            /// <summary>
            /// Cache key template for data type.
            /// </summary>
            public static string DataType = "BlockPreview_DataType_{0}";
        }
    }
}