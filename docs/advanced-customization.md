# Advanced Customization

## Custom Block Preview Service
For advanced scenarios, you can create a custom implementation of `IBlockPreviewService` to have full control over how blocks are rendered and styled. This is useful when you need:
- Dynamic stylesheet selection based on content properties
- Theme-based view resolution
- Custom rendering logic
- Custom ViewData passed to your views

### Overridable Methods

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

## Request Enricher
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
