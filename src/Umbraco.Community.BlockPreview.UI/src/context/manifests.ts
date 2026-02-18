// ManifestGlobalContext is only available in extension-registry, not extension-api
import { ManifestGlobalContext } from "@umbraco-cms/backoffice/extension-registry";

const contexts: Array<ManifestGlobalContext> = [
    {
        type: 'globalContext',
        alias: 'BlockPreview.Context',
        name: 'BlockPreview Context',
        js: () => import('./block-preview.context.ts')
    }
]

export const manifests = contexts;