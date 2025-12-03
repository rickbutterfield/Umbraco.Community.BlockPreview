# BlockPreview
[![Platform](https://img.shields.io/badge/Umbraco-17+-%233544B1?style=flat&logo=umbraco)](https://umbraco.com/products/umbraco-cms/)
[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.BlockPreview.svg)](https://www.nuget.org/packages/Umbraco.Community.BlockPreview/)
[![GitHub](https://img.shields.io/github/license/rickbutterfield/Umbraco.Community.BlockPreview)](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE)

**BlockPreview** enables easy to use rich HTML backoffice previews for the Umbraco Block Grid, Block List and Rich Text editors, with full support for both Razor views and ViewComponents.

<img src="https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/develop/.github/assets/icon.png" alt="Umbraco.Community.BlockPreview icon" height="150" align="right">

## Installation
> [!NOTE]
> **v5.x** supports Umbraco v17
> 
> **v4.x** supports Umbraco v16
> 
> **v1.x** supports Umbraco v10.x - v13.x
> 
> To understand more about which Umbraco CMS versions are actively supported by Umbraco HQ, please see [Umbraco's Long-term Support (LTS) and End-of-Life (EOL) policy](https://umbraco.com/products/knowledge-center/long-term-support-and-end-of-life/).

The Umbraco v17 version of this package is [available via NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview).

To install the package, you can use either .NET CLI:

```
dotnet add package Umbraco.Community.BlockPreview --version 5.0.0-rc2.2
```

or the NuGet Package Manager:

```
Install-Package Umbraco.Community.BlockPreview -Version 5.0.0-rc2.2
```

## Setup
> [!IMPORTANT]
> Generated strongly typed models must exist on disk for BlockPreview to work. `Umbraco:Cms:ModelsBuilder:ModelsMode` **must** be set to either `SourceCodeAuto` or `SourceCodeManual` in your development environment and generated files committed to disk before deploying.
> 
> If you are using [Limbo.Umbraco.ModelsBuilder](https://github.com/limbo-works/Limbo.Umbraco.ModelsBuilder), the default configuration is to have `ModelsMode` set to nothing. Once this is set, generate models in the backoffice as normal.
> ```json
> "Umbraco": {
>  "CMS": {
>    "ModelsBuilder": {
>      "ModelsMode": "SourceCodeAuto"
>    }
>  }
>}
>```

BlockPreview can be configured in the `Program.cs` file, before the call to the `.Build()` method:
```diff
+using Umbraco.Community.BlockPreview.Extensions;

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
+   .AddBlockPreview(options =>
+   {
+       options.BlockGrid = new()
+       {
+           Enabled = true,
+           ContentTypes = [RichTextBlock.ModelTypeAlias]
+       };
+
+       options.BlockList = new()
+       {
+           Enabled = true
+       };
+
+       options.RichText.Enabled = false;
+   })
    .Build();
```

Alternatively, it can be configured in `appsettings.json`:
```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ContentTypes": ["richTextBlock"]
    },
    "BlockList": {
      "Enabled": true
    },
    "RichText": {
      "Enabled": false
    }
  }
}
```

## Options
The following options can be configured, either in `.AddBlockPreview()` or `appsettings.json`:
```cs
builder.AddBlockPreview(options =>
{
  options.BlockGrid = new()
  {
      Enabled = true,
      ContentTypes = [],
      ViewLocations = []
      Stylesheet = ""
  };

  options.BlockList = new()
  {
      Enabled = true,
      ContentTypes = [],
      ViewLocations = [],
      Stylesheet = ""
  };

  options.RichText = new()
  {
      Enabled = true,
      ContentTypes = [],
      ViewLocations = [],
      Stylesheet = ""
  };
})
```

```
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ContentTypes": [],
      "ViewLocations": []
      "Stylesheet": ""
    },
    "BlockList": {
      "Enabled": false,
      "ContentTypes": [],
      "ViewLocations": [],
      "Stylesheet": ""
    },
    "RichText": {
      "Enabled": false,
      "ContentTypes": [],
      "ViewLocations": [],
      "Stylesheet": ""
    }
  }
}
```

### Settings
#### BlockPreview
| Property  | Type                                      | Description                                    |
|-----------|-------------------------------------------|------------------------------------------------|
| BlockGrid | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Block Grid previews |
| BlockList | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Block List previews |
| RichText  | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Rich Text previews  |

#### BlockTypeSettings
| Property      | Type                     | Description                                                                                                                                                                                                   |
|---------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Enabled       | boolean                  | Toggle previews on or off for a given data type.                                                                                                                                                              |
| ContentTypes  | string[] \| List<string> | A list of content type aliases to enable the previews for. If left blank, all blocks will be enabled.                                                                                                         |
| ViewLocations | string[] \| List<string> | A list of custom view paths to be searched for your partial views. Use `{0}` as a placeholder for the content type alias. Custom locations are searched before default paths. Default paths are automatically included. |
| Stylesheet    | string                   | Path to a stylesheet (relative to `/wwwroot`) to be loaded for every block preview of this type. For example: `/css/myblockgridlayout.css`. Can be overridden by implementing a custom `IBlockPreviewService`. |


## Usage
This package installs a custom Web Component preview for the Block Grid, Block List and Rich Text editors in the backoffice.

Before and after of how components look within the Block Grid:
![Screenshot2](https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/develop/.github/assets/screenshot2.png "Before and after of how components look within the Block Grid")

### Grid-specific setup
When using the new Block Grid, replace the references below in your default Grid template partial views, and and custom views that render areas:

`/Views/Partials/blockgrid/default.cshtml`
```diff
<div class="umb-block-grid"
     data-grid-columns="@(Model.GridColumns?.ToString() ?? "12");"
     style="--umb-block-grid--grid-columns: @(Model.GridColumns?.ToString() ?? "12");">
-   @await Html.GetBlockGridItemsHtmlAsync(Model)
+   @await Html.GetPreviewBlockGridItemsHtmlAsync(Model)
</div>
```

`/Views/Partials/blockgrid/areas.cshtml`
```diff
<div class="umb-block-grid__area-container"
     style="--umb-block-grid--area-grid-columns: @(Model.AreaGridColumns?.ToString() ?? Model.GridColumns?.ToString() ?? "12");">
    @foreach (var area in Model.Areas)
    {
-       @await Html.GetBlockGridItemAreaHtmlAsync(area)
+       @await Html.GetPreviewBlockGridItemAreaHtmlAsync(area)
    }
</div>
```

`/Views/Partials/blockgrid/area.cshtml`
```diff
<div class="umb-block-grid__area"
     data-area-col-span="@Model.ColumnSpan"
     data-area-row-span="@Model.RowSpan"
     data-area-alias="@Model.Alias"
     style="--umb-block-grid--grid-columns: @Model.ColumnSpan;--umb-block-grid--area-column-span: @Model.ColumnSpan; --umb-block-grid--area-row-span: @Model.RowSpan;">
-   @await Html.GetBlockGridItemsHtmlAsync(Model)
+   @await Html.GetPreviewBlockGridItemsHtmlAsync(Model)
</div>
```

You will also need to use `@await Html.GetPreviewBlockGridItemAreasHtmlAsync(Model)` in any custom Razor views that contain areas, for example...
```diff
<section
    style="background-color: #@backgroundColor"
    @(noBackgroundColor ? "nobackgroundcolor" : null)
    @(hasBrightContrast ? "bright-contrast" : null)>
+   await Html.GetPreviewBlockGridItemAreasHtmlAsync(Model)
</section>
```

All of these extensions can be found in the namespace `Umbraco.Community.BlockPreview.Extensions`. This ensures that the grid editors correctly load in the back office.

### Preview mode
This package adds an `IsBlockPreviewRequest()` extension to `HttpContext.Request`, similar to `IsBackOfficeRequest()` and `IsFrontEndRequest()` so you can add custom code to your views that only appears in the back office.

For example:
```razor
@using Umbraco.Community.BlockPreview.Extensions
@inherits UmbracoViewPage<BlockGridItem<TContent, TSettings>>

@if (Context.Request.IsBlockPreviewRequest())
{
    <p>This content will only be shown to content editors in the back office!</p>
}
```

### Custom View Locations
If your block partials are not in the usual `/Views/Partials/block[grid|list]/Components/` paths, you can specify custom locations to search for your views. The `ViewLocations` property accepts an array of view paths with a `{0}` placeholder that will be replaced with the content type alias.

You can configure this in `Program.cs`:
```cs
builder.AddBlockPreview(options =>
{
    options.BlockGrid = new()
    {
        Enabled = true,
        ViewLocations = ["/Views/CustomBlocks/{0}.cshtml", "/Views/Themes/Default/BlockGrid/{0}.cshtml"]
    };
})
```

Or in `appsettings.json`:
```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ViewLocations": ["/Views/CustomBlocks/{0}.cshtml", "/Views/Themes/Default/BlockGrid/{0}.cshtml"]
    }
  }
}
```

**How it works:**
- Custom view locations are searched **before** the default paths
- The default paths (`/Views/Partials/blockgrid/Components/`, `/Views/Partials/blocklist/Components/`, `/Views/Partials/richtext/Components/`) are automatically included and don't need to be specified
- The `{0}` placeholder is replaced with the content element alias (e.g., `heroBlock`)
- Multiple custom locations can be specified and will be searched in order

### Stylesheet Loading
You can specify a stylesheet to be loaded for block previews in the backoffice. This is useful for applying custom styles to your blocks without affecting the rest of the backoffice.

Configure in `Program.cs`:
```cs
builder.AddBlockPreview(options =>
{
    options.BlockGrid = new()
    {
        Enabled = true,
        Stylesheet = "/css/myblockgridlayout.css"
    };
    options.BlockList = new()
    {
        Enabled = true,
        Stylesheet = "/css/myblocklistlayout.css"
    };
})
```

Or in `appsettings.json`:
```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "Stylesheet": "/css/myblockgridlayout.css"
    },
    "BlockList": {
      "Enabled": true,
      "Stylesheet": "/css/myblocklistlayout.css"
    }
  }
}
```

**Important notes:**
- The stylesheet path must be relative to the `/wwwroot` directory
- The stylesheet will be loaded for **every** block preview of that type in the backoffice
- You can specify different stylesheets for Block Grid, Block List, and Rich Text editors

## Advanced Customization

### Custom Block Preview Service
For advanced scenarios, you can create a custom implementation of `IBlockPreviewService` to have full control over how blocks are rendered and styled. This is useful when you need:
- Dynamic stylesheet selection based on content properties
- Theme-based view resolution
- Custom rendering logic
- Custom ViewData passed to your views

#### Overridable Methods

The `BlockPreviewService` provides several protected virtual methods you can override:

- **`GetStylesheetPath()`** - Dynamically determine the stylesheet path for a block preview
- **`GetViewResult()`** - Customize view resolution logic (e.g., theme-based views)
- **`CreateViewData()`** - Add custom data to the ViewData dictionary passed to your views

**Example: Theme-based stylesheet and view location**

```cs
using Umbraco.Community.BlockPreview.Services;
using Umbraco.Community.BlockPreview.Interfaces;
using Umbraco.Community.BlockPreview.Enums;

public class CustomBlockPreviewService : BlockPreviewService
{
    private readonly IRazorViewEngine _razorViewEngine;

    public CustomBlockPreviewService(/* inject required dependencies */) 
        : base(/* pass dependencies to base */)
    {
        _razorViewEngine = razorViewEngine;
    }

    // Override to provide dynamic stylesheet paths
    public override Task<string?> GetStylesheetPath(BlockType blockType, IPublishedContent content, ControllerContext controllerContext)
    {
        // Check if a theme is set in the request context
        if (controllerContext.HttpContext.Items.TryGetValue("theme", out var themeObj) && themeObj is string theme)
        {
            return Task.FromResult<string?>($"/css/{theme}.blockgridlayout.css");
        }
        
        // Fall back to the default configured stylesheet
        return base.GetStylesheetPath(blockType, content, controllerContext);
    }

    // Override to provide custom view resolution logic
    protected override ViewEngineResult? GetViewResult(BlockPreviewContext context)
    {
        if (context.ControllerContext.HttpContext.Items.TryGetValue("theme", out var themeObj) && themeObj is string theme)
        {
            string blockType = context.BlockType switch
            {
                BlockType.BlockGrid => "Blockgrid",
                BlockType.BlockList => "Blocklist",
                BlockType.RichText => "Richtext",
                _ => null
            };

            if (blockType != null)
            {
                string themedPath = $"~/Views/Themes/{theme}/{blockType}/Components/{context.ContentAlias}.cshtml";
                return _razorViewEngine.GetView("", themedPath, false);
            }
        }
        
        return base.GetViewResult(context);
    }

    // Override to add custom data to ViewData
    protected override ViewDataDictionary CreateViewData(object? typedBlockInstance, BlockPreviewContext context)
    {
        // Get the base ViewData (includes model, blockPreview, blockIndex, etc.)
        var viewData = base.CreateViewData(typedBlockInstance, context);

        // Add custom data accessible in your views via ViewData
        if (context.ControllerContext.HttpContext.Items.TryGetValue("theme", out var theme))
        {
            viewData["theme"] = theme;
        }

        // Add any other custom data your views need
        viewData["customData"] = "Your custom value";

        return viewData;
    }
}
```

**Default ViewData properties:**

The base `CreateViewData()` method automatically includes the following in ViewData:
- `Model` - The strongly-typed block instance (BlockGridItem, BlockListItem, etc.)
- `blockPreview` - Boolean flag set to `true` (useful for conditional rendering)
- `blockIndex` - The index of the block in the list/grid
- `blockGridPreview` - Boolean flag set to `true` for Block Grid blocks
- `matchingBlockConfig` - Block Grid configuration (only for blocks with areas)

You can access custom ViewData in your Razor views:
```razor
@inherits UmbracoViewPage<BlockGridItem<MyBlock>>

@{
    var theme = ViewData["theme"] as string;
    var customData = ViewData["customData"] as string;
}

<div class="block block--@theme">
    <!-- Your block markup -->
</div>
```

Register your custom service in `Program.cs`:
```cs
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddBlockPreview(options => { /* configure options */ })
    .Build();

// Register custom service (must be after AddBlockPreview)
builder.Services.AddUnique<IBlockPreviewService, CustomBlockPreviewService>(ServiceLifetime.Scoped);
```

### Request Enricher
The `IBlockPreviewRequestEnricher` interface allows you to enrich the HTTP request context before blocks are rendered. This is useful for:
- Setting theme information from content properties
- Adding custom data to `HttpContext.Items` for use in views or custom services
- Implementing variant-specific rendering logic

**Example: Setting theme from content property**

```cs
using Umbraco.Community.BlockPreview.Interfaces;

public class BlockPreviewRequestEnricher : IBlockPreviewRequestEnricher
{
    public Task EnrichAsync(
        HttpContext httpContext, 
        IPublishedContent? content, 
        string? blockEditorAlias = null,
        string? contentElementAlias = null, 
        string? contentUdi = null, 
        string? settingsUdi = null, 
        int? blockIndex = null)
    {
        if (content == null)
            return Task.CompletedTask;

        // Get theme from content or ancestors
        var theme = content.Value<string>("theme", fallback: Fallback.ToAncestors);

        if (!string.IsNullOrEmpty(theme))
        {
            // Store theme in HttpContext.Items for use by custom services
            httpContext.Items["theme"] = theme;
        }

        return Task.CompletedTask;
    }
}
```

Register your enricher in `Program.cs`:
```cs
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddBlockPreview(options => { /* configure options */ })
    .Build();

// Register custom enricher (must be after AddBlockPreview)
builder.Services.AddUnique<IBlockPreviewRequestEnricher, BlockPreviewRequestEnricher>(ServiceLifetime.Scoped);
```

**Available parameters:**
- `httpContext` - The current HTTP context
- `content` - The published content being edited
- `blockEditorAlias` - The alias of the block editor property
- `contentElementAlias` - The content type alias of the block element
- `contentUdi` - The UDI of the content element
- `settingsUdi` - The UDI of the settings element (if applicable)
- `blockIndex` - The index of the block in the list/grid (if applicable)

## Contribution guidelines
To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes. Feel free to add ideas to the repository's issues list if you would to discuss anything related to the library.

### Using the test sites
The repo comes with a test site for Umbraco 17. The site is configured with uSync out of the box to get you up and running with a test site quickly. Use the following credentials to log into the back office:

```
Username: admin@example.com
Password: 1234567890
```

### Who do I talk to?
This project is maintained by [Rick Butterfield](https://rickbutterfield.dev) and contributors. If you have any questions about the project please get in touch on [Bluesky](https://bsky.app/profile/rickbutterfield), or by raising an issue on GitHub.

## Credits
This package is entirely based on the amazing work done by [Dave Woestenborghs](https://github.com/dawoe) for [24days in Umbraco 2021](https://archive.24days.in/umbraco-cms/2021/advanced-blocklist-editor/). His code has been extended to support the new Block Grid editor in v10.4+ and turned into this package.

[Matthew Wise](https://github.com/Matthew-Wise) also wrote a great article for [24days in Umbraco 2022](https://24days.in/umbraco-cms/2022/more-blocklist-editor/) which added the ability to surface `ViewComponents` and has allowed his code to be contributed.

## License
Copyright &copy; 2022-2025 [Rick Butterfield](https://rickbutterfield.dev), and other contributors.

Licensed under the [MIT License](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE.md).
