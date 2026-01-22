import { UmbExtensionManifestKind } from "@umbraco-cms/backoffice/extension-registry";
import { UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST } from "@umbraco-cms/backoffice/property-action";

export const UMB_PROPERTY_ACTION_SORT_MODE: UmbExtensionManifestKind = {
    type: 'kind',
    alias: 'Umb.PropertyAction.SortMode',
    matchKind: 'sortMode',
    matchType: 'propertyAction',
    manifest: {
        ...UMB_PROPERTY_ACTION_DEFAULT_KIND_MANIFEST.manifest,
        type: 'propertyAction',
        kind: 'sortMode',
        api: () => import('./sort-mode.property-action.js'),
        weight: 100,
        meta: {
            icon: 'icon-navigation-vertical',
            label: 'Sort Mode'
        }
    }
};

export const manifests: Array<UmbExtensionManifest | UmbExtensionManifestKind> = [
    UMB_PROPERTY_ACTION_SORT_MODE,
];