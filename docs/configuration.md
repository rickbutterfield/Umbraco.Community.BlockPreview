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
      IgnoredContentTypes = [],
      ViewLocations = [],
      Stylesheets = []
  };

  options.BlockList = new()
  {
      Enabled = true,
      ContentTypes = [],
      IgnoredContentTypes = [],
      ViewLocations = [],
      Stylesheets = []
  };

  options.RichText = new()
  {
      Enabled = true,
      ContentTypes = [],
      IgnoredContentTypes = [],
      ViewLocations = [],
      Stylesheets = []
  };
})
```

```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ContentTypes": [],
      "IgnoredContentTypes": [],
      "ViewLocations": [],
      "Stylesheets": []
    },
    "BlockList": {
      "Enabled": false,
      "ContentTypes": [],
      "IgnoredContentTypes": [],
      "ViewLocations": [],
      "Stylesheets": []
    },
    "RichText": {
      "Enabled": false,
      "ContentTypes": [],
      "IgnoredContentTypes": [],
      "ViewLocations": [],
      "Stylesheets": []
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
| Property            | Type                     | Description                                                                                                                                                                                                   |
|---------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Enabled             | boolean                  | Toggle previews on or off for a given data type.                                                                                                                                                              |
| ContentTypes        | string[] \| List<string> | A list of content type aliases to enable the previews for. If left blank, all blocks will be enabled.                                                                                                         |
| IgnoredContentTypes | string[] \| List<string> | A list of content type aliases to exclude from previews. Only applies when `ContentTypes` is not set. See [Ignoring Content Types](#ignoring-content-types) for details.                                      |
| ViewLocations       | string[] \| List<string> | A list of custom view paths to be searched for your partial views. Use `{0}` as a placeholder for the content type alias. Custom locations are searched before default paths. Default paths are automatically included. |
| Stylesheets         | string[] \| List<string> | Paths to stylesheets (relative to `/wwwroot`) to be loaded for every block preview of this type. For example: `["/css/grid-layout.css", "/css/custom-blocks.css"]`. Can be overridden by implementing a custom `IBlockPreviewService`. |
| Stylesheet          | string                   | **Deprecated.** Use `Stylesheets` instead. Path to a single stylesheet (relative to `/wwwroot`). Still supported for backwards compatibility but will generate a compiler warning. |

## Ignoring Content Types

The `IgnoredContentTypes` property allows you to exclude specific element types from previews without having to explicitly list all the ones you want. This is useful when you have many element types but only want to exclude a few.

Configure in `Program.cs`:
```cs
builder.AddBlockPreview(options =>
{
    options.BlockGrid = new()
    {
        Enabled = true,
        IgnoredContentTypes = ["internalBlock", "deprecatedBlock"]
    };
})
```

Or in `appsettings.json`:
```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "IgnoredContentTypes": ["internalBlock", "deprecatedBlock"]
    }
  }
}
```

**How it works:**

| `ContentTypes` | `IgnoredContentTypes` | Result |
|----------------|----------------------|--------|
| Set | Any | Uses `ContentTypes` as-is (ignores `IgnoredContentTypes`) |
| Empty/not set | Set | All element types minus ignored ones |
| Empty/not set | Empty/not set | Previews enabled for all element types |

- `ContentTypes` takes priority - if you explicitly set `ContentTypes`, the `IgnoredContentTypes` setting is ignored
- `IgnoredContentTypes` is a convenience for "all element types except these"
- The comparison is case-insensitive

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
You can specify one or more stylesheets to be loaded for block previews in the backoffice. This is useful for applying custom styles to your blocks without affecting the rest of the backoffice.

Configure in `Program.cs`:
```cs
builder.AddBlockPreview(options =>
{
    options.BlockGrid = new()
    {
        Enabled = true,
        Stylesheets = ["/css/grid-layout.css", "/css/custom-blocks.css"]
    };
    options.BlockList = new()
    {
        Enabled = true,
        Stylesheets = ["/css/list-layout.css"]
    };
})
```

Or in `appsettings.json`:
```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "Stylesheets": ["/css/grid-layout.css", "/css/custom-blocks.css"]
    },
    "BlockList": {
      "Enabled": true,
      "Stylesheets": ["/css/list-layout.css"]
    }
  }
}
```

**Important notes:**
- Stylesheet paths must be relative to the `/wwwroot` directory
- All specified stylesheets will be loaded for **every** block preview of that type in the backoffice
- You can specify different stylesheets for Block Grid, Block List, and Rich Text editors
- Duplicate stylesheet paths are automatically filtered out

### Migrating from Stylesheet (deprecated)

The single `Stylesheet` property is deprecated. Migrate to `Stylesheets`:

```cs
// Before (deprecated - generates compiler warning)
options.BlockGrid = new()
{
    Enabled = true,
    Stylesheet = "/css/myblockgridlayout.css"
};

// After (recommended)
options.BlockGrid = new()
{
    Enabled = true,
    Stylesheets = ["/css/myblockgridlayout.css"]
};
```

> **Note:** The deprecated `Stylesheet` property still works for backwards compatibility. If both `Stylesheet` and `Stylesheets` are configured, all stylesheets are combined (with duplicates removed).

## Razor Class Library (RCL) Support

BlockPreview works seamlessly with views hosted in Razor Class Libraries (RCLs). If you've configured a custom `IViewLocationExpander` for your RCL views, the same expander will be used for previews in the backoffice.

### How It Works

BlockPreview uses the standard ASP.NET Core Razor view engine and adds its own `IViewLocationExpander` to support custom view locations. This means:

- Any existing `IViewLocationExpander` implementations you've registered are respected
- Views embedded in RCLs are discovered automatically
- No additional configuration is required for RCL support

### Example RCL Setup

If your blocks are in an RCL with views at `/Views/Partials/blocklist/Components/`:

1. Ensure your RCL project has views configured for embedding (this is the default for RCL projects)
2. Register your view location expander as normal in your main project
3. BlockPreview will automatically discover and render these views

```csharp
// Example: Custom view location expander for an RCL
public class MyRclViewLocationExpander : IViewLocationExpander
{
    public void PopulateValues(ViewLocationExpanderContext context) { }

    public IEnumerable<string> ExpandViewLocations(
        ViewLocationExpanderContext context,
        IEnumerable<string> viewLocations)
    {
        // Add your RCL view locations
        return viewLocations.Concat(new[]
        {
            "/Views/Partials/blockgrid/Components/{0}.cshtml",
            "/Views/Partials/blocklist/Components/{0}.cshtml"
        });
    }
}
```

Alternatively, you can use the `ViewLocations` configuration option to specify custom paths without creating an expander:

```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ViewLocations": ["/Views/MyRcl/BlockGrid/{0}.cshtml"]
    }
  }
}
```
