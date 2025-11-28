# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlockPreview is an Umbraco CMS community package that enables rich HTML backoffice previews for Block Grid, Block List, and Rich Text editors. The package renders blocks using the same Razor views or ViewComponents that appear on the frontend, giving content editors accurate WYSIWYG previews.

**Version**: 5.x (supports Umbraco 17 on .NET 10)

## Development Commands

### Building

```bash
# Build the entire solution
dotnet build Umbraco.Community.BlockPreview.sln --configuration Release

# Build specific projects
dotnet build src/Umbraco.Community.BlockPreview/Umbraco.Community.BlockPreview.csproj --configuration Release
dotnet build examples/Umbraco.Community.BlockPreview.TestSite/Umbraco.Community.BlockPreview.TestSite.csproj
```

### UI Development (TypeScript/Vite)

```bash
cd src/Umbraco.Community.BlockPreview.UI

# Install dependencies (requires Node.js >=22.12.0)
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Watch mode (rebuild on changes)
npm run watch

# Generate OpenAPI TypeScript client from C# API
npm run generate
```

### Test Site

The repository includes a test site at `examples/Umbraco.Community.BlockPreview.TestSite/` configured with uSync for quick setup.

**Credentials:**
- Username: `admin@example.com`
- Password: `1234567890`

Run the test site from the solution root or examples directory.

## Architecture

### Two-Package Structure

1. **Umbraco.Community.BlockPreview** (C# Backend)
   - Location: `src/Umbraco.Community.BlockPreview/`
   - Server-side rendering logic, API controllers, configuration
   - Bundles compiled UI assets into `wwwroot/App_Plugins/`

2. **Umbraco.Community.BlockPreview.UI** (TypeScript Frontend)
   - Location: `src/Umbraco.Community.BlockPreview.UI/`
   - Lit web components for Umbraco backoffice
   - Built with Vite, outputs to main package's wwwroot

### Key Backend Components

- **BlockPreviewApiController** (`Controllers/BlockPreviewApiController.cs`)
  - API versioned controller at `/block-preview/api`
  - Endpoints: `/preview/grid`, `/preview/list`, `/preview/rte`, `/settings`
  - Receives block JSON, returns rendered HTML

- **BlockPreviewService** (`Services/BlockPreviewService.cs`)
  - Core rendering service implementing `IBlockPreviewService`
  - Deserializes block data, resolves ModelsBuilder types, finds views/ViewComponents
  - Handles nested blocks recursively

- **BlockPreviewComposer** (`BlockPreviewComposer.cs`)
  - Registers all services with Umbraco DI
  - Sets up notification handlers for cache invalidation
  - Configures custom view locations

- **View Resolution** (`ViewEngines/BlockPreviewViewEngineOptionsSetup.cs`)
  - Extends Razor view engine with custom locations
  - Default paths: `/Views/Partials/block[grid|list|richtext]/Components/{0}.cshtml`
  - Supports ViewComponents as alternative to Razor views

### Key Frontend Components

- **Custom View Elements** (`src/blockEditor/`)
  - `BlockGridPreviewCustomView` - Block Grid preview renderer
  - `BlockListPreviewCustomView` - Block List preview renderer
  - `RichTextPreviewCustomView` - Rich Text Editor preview renderer
  - All use Umbraco's observable API to react to content changes (500ms debounce)

- **Context Management** (`src/context/`)
  - `BlockPreviewContext` - Shared state container for settings and document info
  - Provides configuration to all components

- **Property Actions** (`src/propertyActions/`)
  - Sort mode toggle to switch between preview and reordering modes
  - Reduces rendering overhead when reorganizing blocks

### Request Flow

1. User edits block → Frontend observes change (debounced)
2. Frontend collects block data + metadata (node key, culture, document type)
3. POST to backend API endpoint
4. Backend validates, sets up published content context
5. Deserializes JSON to `IPublishedElement`, resolves ModelsBuilder types
6. Finds matching Razor view or ViewComponent
7. Renders view, captures HTML output
8. Post-processes HTML (disables links/forms for safety)
9. Returns HTML to frontend
10. Frontend renders with `unsafeHTML()`, injects stylesheet

### Configuration

Configuration via `appsettings.json` or `.AddBlockPreview()` in `Program.cs`:

```json
{
  "BlockPreview": {
    "BlockGrid": {
      "Enabled": true,
      "ViewLocations": ["/Views/Components/{0}.cshtml"],
      "ContentTypes": ["richTextBlock"],
      "Stylesheet": "/css/preview.css"
    },
    "BlockList": { "Enabled": true },
    "RichText": { "Enabled": false }
  }
}
```

### Extensibility

- **IBlockPreviewRequestEnricher** - Hook for custom logic before rendering (add HTTP context items, route values)
- **Custom View Locations** - Configure non-standard paths for block views
- **Stylesheet Injection** - Per-block-type CSS in backoffice previews
- **Override BlockPreviewService methods** - `GetViewResult()`, `CreateViewData()`, `GetStylesheetPath()`

## Important Constraints

1. **ModelsBuilder Models Required**
   - Must use `SourceCodeAuto` or `SourceCodeManual` mode (not PureLive)
   - Generated models must exist on disk
   - Package checks for `[PublishedModel]` attribute via reflection

2. **View Naming Convention**
   - Each block needs a view: `{blockAlias}.cshtml` or `{BlockAlias}ViewComponent`
   - Searches PascalCase and camelCase variations

3. **Grid-Specific Extensions**
   - Must use `@await Html.GetPreviewBlockGridItemsHtmlAsync(Model)` instead of `GetBlockGridItemsHtmlAsync()`
   - Required in `/Views/Partials/blockgrid/default.cshtml`, `areas.cshtml`, `area.cshtml`
   - For custom views with areas: use `@await Html.GetPreviewBlockGridItemAreasHtmlAsync(Model)`

4. **Preview Mode Detection**
   - Use `Context.Request.IsBlockPreviewRequest()` in views to add backoffice-only content

## Versioning

- Uses Nerdbank.GitVersioning (`version.json`)
- Version: `5.0.0` for Umbraco 17
- Release tags: `release-{version}` (e.g., `release-5.0.0`)
- Release branches: `release/{version}`

## Sustainability Guidelines

This project follows sustainability-focused development practices per `AGENTS.md`:

- Minimize HTTP requests (combine assets, lazy load)
- Optimize images (WebP/AVIF formats)
- Use system fonts where possible
- Monitor Core Web Vitals
- Restrict 3rd party dependencies
- Remove unused content/media
- Limit token usage in responses

## Code Style

Per `AGENTS.md`:
- Do not write comments explaining what code does
- Comments only for explaining why decisions were made
- Keep responses short and informative
- Mark important information in bold

## File Structure

```
src/
├── Umbraco.Community.BlockPreview/        # C# main package
│   ├── Controllers/                        # API endpoints
│   ├── Services/                           # Core rendering logic
│   ├── Extensions/                         # Builder and utility extensions
│   ├── ViewEngines/                        # Custom view location expanders
│   ├── Configuration/                      # Options and settings
│   ├── NotificationHandlers/               # Cache invalidation
│   └── wwwroot/App_Plugins/                # Compiled UI assets (output)
└── Umbraco.Community.BlockPreview.UI/     # TypeScript UI package
    ├── src/
    │   ├── blockEditor/                    # Lit custom view elements
    │   ├── context/                        # Shared state management
    │   ├── propertyActions/                # Sort mode toggle
    │   ├── api/                            # Generated TypeScript client
    │   └── index.ts                        # Entry point
    ├── public/                             # Static assets + umbraco-package.json
    └── vite.config.ts                      # Build configuration

examples/
└── Umbraco.Community.BlockPreview.TestSite/  # Test site with uSync

Directory.Build.props                       # Shared MSBuild properties (.NET 10)
Directory.Packages.props                    # Central Package Management
version.json                                # Nerdbank.GitVersioning config
```

## Common Tasks

### Adding a New Block Type

1. Create content type in Umbraco backoffice
2. Generate ModelsBuilder models (ensure `SourceCodeAuto` or `SourceCodeManual`)
3. Create Razor view at `/Views/Partials/block[grid|list]/Components/{blockAlias}.cshtml`
   - Or create ViewComponent: `{BlockAlias}ViewComponent`
4. Model should inherit from `BlockGridItem<TContent, TSettings>` or `BlockListItem<TContent, TSettings>`

### Implementing Custom Request Enricher

```csharp
public class MyEnricher : IBlockPreviewRequestEnricher
{
    public Task EnrichAsync(HttpContext httpContext, Guid nodeKey, string? culture)
    {
        httpContext.Items["CustomData"] = "value";
        return Task.CompletedTask;
    }
}

// Register in Program.cs
builder.Services.AddUnique<IBlockPreviewRequestEnricher, MyEnricher>();
```

### Adding Custom View Locations

```json
{
  "BlockPreview": {
    "BlockGrid": {
      "ViewLocations": [
        "/Views/MyCustomPath/{0}.cshtml",
        "/Features/{0}/BlockView.cshtml"
      ]
    }
  }
}
```

### Debugging Preview Rendering

1. Set breakpoint in `BlockPreviewService.cs` → `RenderBlockAsync()`
2. Check `blockData` deserialization and ModelsBuilder type resolution
3. Verify view path in `GetViewResult()`
4. Inspect ViewData and model passed to view
5. Frontend: Use browser DevTools to inspect POST to `/block-preview/api/preview/*`

### Regenerating TypeScript API Client

After changing C# controller methods:

```bash
cd src/Umbraco.Community.BlockPreview.UI
npm run generate
```

Ensure OpenAPI spec is exposed by running the backend first.

## Release Process

Releases are automated via GitHub Actions (`release.yml`):

1. Push tag: `git tag release-5.0.0 && git push origin release-5.0.0`
   - Or create release branch: `release/5.0.0`
2. Workflow builds, packs, and publishes to NuGet
3. Version auto-calculated by Nerdbank.GitVersioning

## References

- Umbraco Documentation: https://docs.umbraco.com/umbraco-cms
- Package NuGet: https://www.nuget.org/packages/Umbraco.Community.BlockPreview/
- GitHub Issues: https://github.com/rickbutterfield/Umbraco.Community.BlockPreview/issues
- Umbraco Sustainability: https://docs.umbraco.com/sustainability-best-practices/
