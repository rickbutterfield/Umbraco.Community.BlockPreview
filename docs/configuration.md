# Configuration

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

```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ContentTypes": [],
      "ViewLocations": [],
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

## Settings

### BlockPreview
| Property  | Type                                      | Description                                    |
|-----------|-------------------------------------------|------------------------------------------------|
| BlockGrid | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Block Grid previews |
| BlockList | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Block List previews |
| RichText  | [`BlockTypeSettings`](#blocktypesettings) | Configure settings for the Rich Text previews  |

### BlockTypeSettings
| Property      | Type                     | Description                                                                                                                                                                                                   |
|---------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Enabled       | boolean                  | Toggle previews on or off for a given data type.                                                                                                                                                              |
| ContentTypes  | string[] \| List<string> | A list of content type aliases to enable the previews for. If left blank, all blocks will be enabled.                                                                                                         |
| ViewLocations | string[] \| List<string> | A list of custom view paths to be searched for your partial views. Use `{0}` as a placeholder for the content type alias. Custom locations are searched before default paths. Default paths are automatically included. |
| Stylesheet    | string                   | Path to a stylesheet (relative to `/wwwroot`) to be loaded for every block preview of this type. For example: `/css/myblockgridlayout.css`. Can be overridden by implementing a custom `IBlockPreviewService`. |

## Custom View Locations
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

## Stylesheet Loading
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
