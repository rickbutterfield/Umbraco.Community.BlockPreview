# Umbraco.Community.BlockPreview
[![Platform](https://img.shields.io/badge/Umbraco-10.4+-%233544B1?style=flat&logo=umbraco)](https://umbraco.com/products/umbraco-cms/)
[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.BlockPreview.svg)](https://www.nuget.org/packages/Umbraco.Community.BlockPreview/)
[![GitHub](https://img.shields.io/github/license/rickbutterfield/Umbraco.Community.BlockPreview)](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/main/LICENSE)

**Umbraco.Community.BlockPreview** enables easy to use rich HTML backoffice previews for the Umbraco Block List and Block Grid editors.

<img src="https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/main/.github/readme-assets/icon.png" alt="Umbraco.Community.BlockPreview icon" height="150" align="right">

## Installation
The Umbraco 10.4+ version of this package is [available via NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview).

To install the package, you can use either .NET CLI:

```
dotnet add package Umbraco.Community.BlockPreview --version 1.6.0
```

or the older NuGet Package Manager:

```
Install-Package Umbraco.Community.BlockPreview -Version 1.6.0
```

## Setup
Once installed, you'll need to add `AddBlockPreview()` to your `Startup.cs` file, before `AddWebsite()`.
```diff
+ @using Umbraco.Community.BlockPreview;
 
 public void ConfigureServices(IServiceCollection services)
 {
     services.AddUmbraco(_env, _config)
         .AddBackOffice()
+        .AddBlockPreview()
         .AddWebsite()
         .AddComposers()
         .Build();
 }
```

## Usage
This package installs a custom Angular preview for both the Block List and Block Grid editors in the backoffice.

When setting up a block to be part of the List or Grid, setting the 'Custom View' property to `block-preview.html` will generate preview HTML based on the respective partial view found in `/Views/Partials/blocklist/Components` or `/Views/Partials/blockgrid/Components` or ViewComponents.

How to select the custom views when creating a Block List/Grid:
![Screenshot](https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/main/screenshots/screenshot1.png "The Umbraco backoffice showing a panel titled 'Select view', with two HTML files in a list available for selection")

Before and after of how components look within the Block Grid:
![Screenshot2](https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/main/screenshots/screenshot2.png "Before and after of how components look within the Block Grid")

### Grid-specific setup
When using the new Block Grid, replace the references below in your Grid template partial views

| Default Umbraco usage | BlockPreview usage |
| --------------------- | ------------------ |
| @await Html.GetBlockGridItemAreasHtmlAsync(Model) | @await Html.GetPreviewBlockGridItemAreasHtmlAsync(Model) |
| @await Html.GetBlockGridItemAreaHtmlAsync(Model) | @await Html.GetPreviewBlockGridItemAreaHtmlAsync(Model) |
| @await Html.GetBlockGridItemsHtmlAsync(Model) | @await Html.GetPreviewBlockGridItemsHtmlAsync(Model) |

All of these extensions can be found in the namespace `Umbraco.Community.BlockPreview.Extensions`. This ensures that the grid editors correctly load in the back office.

### Preview mode
This package adds an `IsBlockPreviewRequest()` extension to `HttpContext.Request`, similar to `IsBackOfficeRequest()` and `IsFrontEndRequest()` so you can add custom code to your views that only appears in the back office.

For example:
```razor
@using Umbraco.Community.BlockPreview.Extensions
@inherits UmbracoViewPage<BlockGridItem>

@if (Context.Request.IsBlockPreviewRequest())
{
    <p>This content will only be shown to content editors in the back office!</p>
}
```

### Custom View locations
If your block partials are not in the usual `/Views/Partials/block[grid|list]/Components/` paths, you can add custom locations in your `appsettings.json`:

```
"BlockPreview": {
  "ViewLocations": {
    "BlockList": ["/path/to/block/list/views/{0}.cshtml"],
    "BlockGrid": ["/path/to/block/grid/views/{0}.cshtml"]
  }
}
```

## Contribution guidelines
To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes. Feel free to add ideas to the repository's issues list if you would to discuss anything related to the library.

### Who do I talk to?
This project is maintained by [Rick Butterfield](https://rickbutterfield.dev) and contributors. If you have any questions about the project please get in touch on [Twitter](https://twitter.com/rickbutterfield), or by raising an issue on GitHub.

## Credits
This package is entirely based on the amazing work done by [Dave Woestenborghs](https://github.com/dawoe) for [24days in Umbraco 2021](https://archive.24days.in/umbraco-cms/2021/advanced-blocklist-editor/). His code has been extended to support the new Block Grid editor in v10.4+ and turned into this package.

[Matthew Wise](https://github.com/Matthew-Wise) also wrote a great article for [24days in Umbraco 2022](https://24days.in/umbraco-cms/2022/more-blocklist-editor/) which added the ability to surface `ViewComponents` and has allowed his code to be contributed.

## License
Copyright &copy; 2022-2023 [Rick Butterfield](https://rickbutterfield.dev), and other contributors.

Licensed under the [MIT License](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/main/LICENSE.md).
