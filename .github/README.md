# BlockPreview
[![Platform](https://img.shields.io/badge/Umbraco-14.2+-%233544B1?style=flat&logo=umbraco)](https://umbraco.com/products/umbraco-cms/)
[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.BlockPreview.svg)](https://www.nuget.org/packages/Umbraco.Community.BlockPreview/)
[![GitHub](https://img.shields.io/github/license/rickbutterfield/Umbraco.Community.BlockPreview)](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE)

**BlockPreview** enables easy to use rich HTML backoffice previews for the Umbraco Block List and Block Grid editors.

<img src="https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/develop/.github/assets/icon.png" alt="Umbraco.Community.BlockPreview icon" height="150" align="right">

## Installation
> [!IMPORTANT]
> **v3.x** supports Umbraco v15
> 
> **v2.x** supports Umbraco v14.2+
> 
> **v1.x** supports Umbraco v10.x - v13.x
> 
> To understand more about which Umbraco CMS versions are actively supported by Umbraco HQ, please see [Umbraco's Long-term Support (LTS) and End-of-Life (EOL) policy](https://umbraco.com/products/knowledge-center/long-term-support-and-end-of-life/).

The Umbraco v14.2+ version of this package is [available via NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview).

To install the package, you can use either .NET CLI:

```
dotnet add package Umbraco.Community.BlockPreview --version 2.0.3
```

or the NuGet Package Manager:

```
Install-Package Umbraco.Community.BlockPreview -Version 2.0.3
```

## Setup
The package can be configured in the `Program.cs` file, before the call to the `.Build()` method:
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
+       options.BlockList = new()
+       {
+           Enabled = false
+       };
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
      ViewLocations = []
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
      "ViewLocations": []
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

#### BlockTypeSettings
| Property      | Type                     | Description                                                                                                     |
|---------------|--------------------------|-----------------------------------------------------------------------------------------------------------------|
| Enabled       | boolean                  | Toggle previews on or off for a given data type.                                                                |
| ContentTypes  | string[] \| List<string> | A list of content type aliases to enable the previews for. If left blank, all blocks will be enabled.           |
| ViewLocations | string[] \| List<string> | A list of custom locations to be searched for your partial views. The default paths are included automatically. |
| Stylesheet    | string                   | **`BlockGrid` only** - path to a stylesheet that exists in /wwwroot, to be loaded for every block preview       |


## Usage
This package installs a custom Web Component preview for both the Block List and Block Grid editors in the backoffice. Block Grid and Block List can be configured independently (v14.2+).

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

### Custom View locations
If your block partials are not in the usual `/Views/Partials/block[grid|list]/Components/` paths, you can add custom locations in your `appsettings.json`:

```
"BlockPreview": {
  "BlockGrid": {
    "ViewLocations": ["/path/to/block/grid/views/{0}.cshtml"]
  }
}
```

## Contribution guidelines
To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes. Feel free to add ideas to the repository's issues list if you would to discuss anything related to the library.

### Using the test sites
The repo comes with a test site for Umbraco 14.2+. The site is configured with uSync out of the box to get you up and running with a test site quickly. Use the following credentials to log into the back office:

```
Username: admin@example.com
Password: 1234567890
```

### Who do I talk to?
This project is maintained by [Rick Butterfield](https://rickbutterfield.dev) and contributors. If you have any questions about the project please get in touch on [Twitter](https://twitter.com/rickbutterfield), or by raising an issue on GitHub.

## Credits
This package is entirely based on the amazing work done by [Dave Woestenborghs](https://github.com/dawoe) for [24days in Umbraco 2021](https://archive.24days.in/umbraco-cms/2021/advanced-blocklist-editor/). His code has been extended to support the new Block Grid editor in v10.4+ and turned into this package.

[Matthew Wise](https://github.com/Matthew-Wise) also wrote a great article for [24days in Umbraco 2022](https://24days.in/umbraco-cms/2022/more-blocklist-editor/) which added the ability to surface `ViewComponents` and has allowed his code to be contributed.

## License
Copyright &copy; 2022-2024 [Rick Butterfield](https://rickbutterfield.dev), and other contributors.

Licensed under the [MIT License](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE.md).
