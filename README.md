# Our.Umbraco.BlockPreview

**Our.Umbraco.BlockPreview** enables rich HTML previews for the Umbraco Block List and Block Grid editors.

## Installation
The Umbraco 10.4+ version of this package is [available via NuGet](https://www.nuget.org/packages/Our.Umbraco.BlockPreview).

To install the package, you can use either .NET CLI:

```
dotnet add package Our.Umbraco.BlockPreview --version 1.0.0-alpha001
```

or the older NuGet Package Manager:

```
Install-Package Our.Umbraco.BlockPreview -Version 1.0.0-alpha001
```

## Usage
This package installs a custom Angular preview for both the Block List and Block Grid editors.

When setting up a block to be part of the List or Grid, setting the 'Custom View' property to the appropriate `block-grid|list-preview.html` file will generate preview HTML based on the respective partial view found in `/Views/Partials/blocklist/Components/` or `/Views/Partials/blocklist/Components/`.

![Screenshot](https://github.com/rickbutterfield/Our.Umbraco.BlockPreview/blob/main/screenshots/screenshot1.png "The Umbraco backoffice showing a panel titled 'Select view', with two HTML files in a list available for selection")

## Thanks
This package is entirely based on the amazing work done by [Dave Woestenborghs for 24days in Umbraco 2021](https://archive.24days.in/umbraco-cms/2021/advanced-blocklist-editor/). His code has been extended to support the new Block Grid editor and turned into this package.