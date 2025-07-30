import { ManifestPropertyAction, MetaPropertyAction } from "@umbraco-cms/backoffice/property-action";

export interface ManifestPropertyActionBlockGridSortMode
    extends ManifestPropertyAction<MetaPropertyActionSortModeKind> {
    type: 'propertyAction',
    kind: 'blockGridSortMode'
}

export interface ManifestPropertyActionBlockListSortMode
    extends ManifestPropertyAction<MetaPropertyActionSortModeKind> {
    type: 'propertyAction',
    kind: 'blockListSortMode'
}

export interface MetaPropertyActionSortModeKind extends MetaPropertyAction { }

declare global {
    interface UmbExtensionManifestMap {
        umbManifestPropertyActionBlockGridSortMode: ManifestPropertyActionBlockGridSortMode;
        umbManifestPropertyActionBlockListSortMode: ManifestPropertyActionBlockListSortMode;
    }
}