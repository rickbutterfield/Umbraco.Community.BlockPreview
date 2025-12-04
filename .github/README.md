# BlockPreview
[![Platform](https://img.shields.io/badge/Umbraco-17+-%233544B1?style=flat&logo=umbraco)](https://umbraco.com/products/umbraco-cms/)
[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.BlockPreview.svg)](https://www.nuget.org/packages/Umbraco.Community.BlockPreview/)
[![GitHub](https://img.shields.io/github/license/rickbutterfield/Umbraco.Community.BlockPreview)](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE)

**BlockPreview** enables easy to use rich HTML backoffice previews for the Umbraco Block Grid, Block List and Rich Text editors, with full support for both Razor views and ViewComponents.

<img src="https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/develop/.github/assets/icon.png" alt="Umbraco.Community.BlockPreview icon" height="150" align="right">

## Supported Versions
> [!NOTE]
> **v5.x** supports Umbraco v17
> 
> **v4.x** supports Umbraco v16
> 
> **v1.x** supports Umbraco v10.x - v13.x
> 
> To understand more about which Umbraco CMS versions are actively supported by Umbraco HQ, please see [Umbraco's Long-term Support (LTS) and End-of-Life (EOL) policy](https://umbraco.com/products/knowledge-center/long-term-support-and-end-of-life/).

## Installation

The Umbraco v17 version of this package is [available via NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview).

To install the package, you can use either .NET CLI:

```
dotnet add package Umbraco.Community.BlockPreview --version 5.0.0
```

or the NuGet Package Manager:

```
Install-Package Umbraco.Community.BlockPreview -Version 5.0.0
```

## Quick Start

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

## Documentation

📖 **[Configuration Guide](docs/configuration.md)** - Detailed configuration options, custom view locations, and stylesheet loading

📖 **[Usage Guide](docs/usage.md)** - How to use BlockPreview in your views and editors

📖 **[Advanced Customization](docs/advanced-customization.md)** - Custom services, request enrichers, and extensibility

## Contribution Guidelines

To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes. Feel free to add ideas to the repository's issues list if you would to discuss anything related to the library.

### Using the Test Sites

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

[Ben White](https://github.com/BenWhite27) contributed the `RequestEnricher` allowing users to [customise View Location and runtime stylesheet loading](https://github.com/rickbutterfield/BlockPreview/pull/116). 

## License

Copyright &copy; 2022-2025 [Rick Butterfield](https://rickbutterfield.dev), and other contributors.

Licensed under the [MIT License](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/blob/develop/LICENSE.md).
