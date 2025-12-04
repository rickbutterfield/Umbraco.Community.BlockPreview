# Usage

This package installs a custom Web Component preview for the Block Grid, Block List and Rich Text editors in the backoffice.

Before and after of how components look within the Block Grid:
![Screenshot2](https://raw.githubusercontent.com/rickbutterfield/Umbraco.Community.BlockPreview/develop/.github/assets/screenshot2.png "Before and after of how components look within the Block Grid")

## Grid-specific setup
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

## Preview mode
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
