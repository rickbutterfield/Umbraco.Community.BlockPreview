import { BlockPreviewService } from "../api";
import { BlockPreviewBaseElement } from './block-preview-base.element';
import { BlockContext } from './types';
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_RTE_ENTRY_CONTEXT, UMB_BLOCK_RTE_MANAGER_CONTEXT, UmbBlockRteValueModel } from "@umbraco-cms/backoffice/block-rte";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";

const elementName = "rich-text-preview";

@customElement(elementName)
export class RichTextPreviewCustomView extends BlockPreviewBaseElement<BlockContext> {

    protected _blockContext: BlockContext = {
        unique: '',
        documentTypeUnique: '',
        contentUdi: '',
        settingsUdi: '',
        blockEditorAlias: '',
        culture: '',
        workspaceEditContentPath: '',
        contentElementTypeAlias: '',
        contentElementTypeKey: '',
        blockIndex: 0
    };

    @state()
    private _blockRteValue: UmbBlockRteValueModel = {
        layout: {},
        expose: [],
        contentData: [],
        settingsData: []
    }

    @property({ attribute: false })
    public set blockRteValue(value: UmbBlockRteValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockRteValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        buildUpValue.expose ??= [];
        this._blockRteValue = buildUpValue as UmbBlockRteValueModel;
    }
    public get blockRteValue(): UmbBlockRteValueModel {
        return this._blockRteValue;
    }

    protected setupContextObservers() {
        this.observePropertyDataset();
        this.#observeDocumentWorkspace();
    }

    #observeDocumentWorkspace() {
        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
            if (context) {
                this._workspaceContextResolved = true;
                this.observe(
                    observeMultiple([context.unique, context.contentTypeUnique]),
                    async ([unique, documentTypeUnique]) => {
                        await this.handleWorkspaceData(unique?.toString(), documentTypeUnique);
                    }
                );
            }
        });

        this.observeBlockWorkspaceFallback();
    }

    protected observeBlockValue(): void {
        this.consumeContext(UMB_BLOCK_RTE_ENTRY_CONTEXT, (context) => {
            if (context != null) {
                this.observe(
                    observeMultiple([
                        context.contentKey,
                        context.settingsKey,
                        context.workspaceEditContentPath,
                        context.contentElementTypeAlias,
                        context.contentElementTypeKey
                    ]),
                    async ([
                        contentUdi,
                        settingsUdi,
                        workspaceEditContentPath,
                        contentElementTypeAlias,
                        contentElementTypeKey
                    ]) => {
                        this._blockContext.contentUdi = contentUdi ?? '';
                        this._blockContext.settingsUdi = settingsUdi ?? '';
                        this._blockContext.workspaceEditContentPath = workspaceEditContentPath ?? '';
                        this._blockContext.contentElementTypeAlias = contentElementTypeAlias ?? '';
                        this._blockContext.contentElementTypeKey = contentElementTypeKey ?? '';

                        await this.#observeBlockPropertyValue();
                    });
            }
        });
    }

    #observeBlockPropertyValue(): void {
        this.consumeContext(UMB_BLOCK_RTE_MANAGER_CONTEXT, (context) => {
            if (context != null) {
                this.observe(
                    observeMultiple([
                        context.contents,
                        context.settings,
                        context.layouts,
                        context.exposes,
                        context.propertyAlias
                    ]),
                    async ([
                        contents,
                        settings,
                        layouts,
                        exposes,
                        propertyAlias
                    ]) => {
                        this._blockContext.blockEditorAlias = propertyAlias ?? '';

                        this.blockRteValue = {
                            contentData: contents?.filter(x => x.key == this._blockContext.contentUdi) ?? [],
                            settingsData: settings?.filter(x => x.key == this._blockContext.settingsUdi) ?? [],
                            expose: exposes?.filter(x => x.contentKey == this._blockContext.contentUdi) ?? [],
                            layout: {
                                ['Umbraco.RichText']: layouts?.filter(x => x.contentKey == this._blockContext.contentUdi) ?? []
                            }
                        };
                    });
            }
        });
    }

    protected callPreviewApi() {
        return tryExecute(this, BlockPreviewService.previewRichTextMarkup({
            body: JSON.stringify(this.blockRteValue),
            query: {
                blockEditorAlias: this._blockContext.blockEditorAlias,
                nodeKey: this._blockContext.unique,
                contentElementAlias: this._blockContext.contentElementTypeAlias,
                documentTypeUnique: this._blockContext.documentTypeUnique,
                culture: this._blockContext.culture
            }
        }));
    }

    protected async fetchStylesheets() {
        const { data } = await tryExecute(this, BlockPreviewService.getRteStylesheets({
            query: {
                documentTypeUnique: this._blockContext.documentTypeUnique,
                nodeKey: this._blockContext.unique
            }
        }));
        return data;
    }
}

export default RichTextPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: RichTextPreviewCustomView;
    }
}
