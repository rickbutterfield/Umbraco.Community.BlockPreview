import { UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS } from "@umbraco-cms/backoffice/block-grid";
import { UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS } from "@umbraco-cms/backoffice/block-list";
import { UMB_PROPERTY_ACTION_SORT_MODE } from "../property/manifests.js";
import { UMB_WRITABLE_PROPERTY_CONDITION_ALIAS } from "@umbraco-cms/backoffice/property";
import { UmbExtensionManifestKind } from "@umbraco-cms/backoffice/extension-registry";

export const manifests: Array<UmbExtensionManifest | UmbExtensionManifestKind> = [
    {
        ...UMB_PROPERTY_ACTION_SORT_MODE.manifest,
        type: 'propertyAction',
        kind: 'sortMode',
        alias: 'BlockPreview.PropertyAction.Grid.SortMode',
        name: 'Block Grid Sort Mode Property Action',
        api: () => import('./block-grid-sort-mode.js'),
        forPropertyEditorUis: [UMB_BLOCK_GRID_PROPERTY_EDITOR_UI_ALIAS],
        conditions: [
            {
                alias: UMB_WRITABLE_PROPERTY_CONDITION_ALIAS,
            },
        ],
    },
    {
        ...UMB_PROPERTY_ACTION_SORT_MODE.manifest,
        type: 'propertyAction',
        kind: 'sortMode',
        alias: 'BlockPreview.PropertyAction.List.SortMode',
        name: 'Block List Sort Mode Property Action',
        api: () => import('./block-list-sort-mode.js'),
        forPropertyEditorUis: [UMB_BLOCK_LIST_PROPERTY_EDITOR_UI_ALIAS],
        conditions: [
            {
                alias: UMB_WRITABLE_PROPERTY_CONDITION_ALIAS,
            },
        ],
    }
];