import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ManifestBlockEditorCustomView } from '@umbraco-cms/backoffice/block-custom-view';
import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';

import { client } from './api/client.gen.js';
import { BlockGridPreviewCustomView, BlockListPreviewCustomView, BlockSinglePreviewCustomView, RichTextPreviewCustomView } from './blockEditor';
import { BLOCK_PREVIEW_CONTEXT } from './context/block-preview.context-token.ts';
import BlockPreviewContext from './context/block-preview.context.ts';
import { manifests as contextManifests } from './context/manifests.ts';
import { manifests as localizationManifests } from './localization/manifests.ts';
import { SettingsRepository } from './repository';

export * from './blockEditor';
export * from './repository';

export const onInit: UmbEntryPointOnInit = async (host, extensionRegistry) => {

    host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
        if (!authContext) return;

        const config = authContext.getOpenApiConfiguration();

        client.setConfig({
            baseUrl: config?.base ?? "",
            auth: config?.token ?? undefined,
            credentials: config?.credentials ?? "same-origin",
        });

        client.interceptors.request.use(async (request, _options) => {
            const token = await config.token();
            request.headers.set('Authorization', `Bearer ${token}`);
            return request;
        });

        const settingsRepository = new SettingsRepository(host);
        const settings = await settingsRepository.getSettings();

        let customViewManifests: ManifestBlockEditorCustomView[] = [];

        if (settings) {
            if (settings.blockGrid.enabled) {
                let blockGridManifest: ManifestBlockEditorCustomView = {
                    type: 'blockEditorCustomView',
                    alias: 'BlockPreview.GridCustomView',
                    name: 'BlockPreview Grid Custom View',
                    element: BlockGridPreviewCustomView,
                    forBlockEditor: 'block-grid'
                };

                if (settings.blockGrid.contentTypes?.length !== 0) {
                    blockGridManifest.forContentTypeAlias = settings.blockGrid.contentTypes as string[];
                }

                customViewManifests.push(blockGridManifest);
            }

            if (settings.blockList.enabled) {
                let blockListManifest: ManifestBlockEditorCustomView = {
                    type: 'blockEditorCustomView',
                    alias: 'BlockPreview.ListCustomView',
                    name: 'BlockPreview List Custom View',
                    element: BlockListPreviewCustomView,
                    forBlockEditor: 'block-list'
                };

                if (settings.blockList.contentTypes?.length !== 0) {
                    blockListManifest.forContentTypeAlias = settings.blockList.contentTypes as string[];
                }

                customViewManifests.push(blockListManifest);
            }

            if (settings.singleBlock.enabled) {
                let singleBlockManifest: ManifestBlockEditorCustomView = {
                    type: 'blockEditorCustomView',
                    alias: 'BlockPreview.SingleBlockCustomView',
                    name: 'BlockPreview Single Block Custom View',
                    element: BlockSinglePreviewCustomView,
                    forBlockEditor: 'block-single'
                };

                if (settings.singleBlock.contentTypes?.length !== 0) {
                    singleBlockManifest.forContentTypeAlias = settings.singleBlock.contentTypes as string[];
                }

                customViewManifests.push(singleBlockManifest);
            }

            if (settings.richText.enabled) {
                let richTextManifest: ManifestBlockEditorCustomView = {
                    type: 'blockEditorCustomView',
                    alias: 'BlockPreview.RichTextCustomView',
                    name: 'BlockPreview Rich Text Custom View',
                    element: RichTextPreviewCustomView,
                    forBlockEditor: 'block-rte'
                };

                if (settings.richText.contentTypes?.length !== 0) {
                    richTextManifest.forContentTypeAlias = settings.richText.contentTypes as string[];
                }

                customViewManifests.push(richTextManifest);
            }
        }

        extensionRegistry.registerMany([
            ...customViewManifests,
            ...contextManifests,
            ...localizationManifests
        ]);

        host.provideContext(BLOCK_PREVIEW_CONTEXT, new BlockPreviewContext(host));
    });
};