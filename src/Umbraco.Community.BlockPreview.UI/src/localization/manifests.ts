import type { ManifestLocalization } from '@umbraco-cms/backoffice/localization';

const localizations: Array<ManifestLocalization> = [
    {
        type: 'localization',
        alias: 'BlockPreview.Localization.En',
        name: 'BlockPreview English Localization',
        meta: {
            culture: 'en',
        },
        js: () => import('./en.ts'),
    },
];

export const manifests = [...localizations];
