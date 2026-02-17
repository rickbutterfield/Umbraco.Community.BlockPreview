import { BlockPreviewBaseElement } from './block-preview-base.element';
import { BlockListContext } from './types';
import { PreviewRepository } from '../repository';
import { css, customElement, html, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_LIST_ENTRY_CONTEXT, UMB_BLOCK_LIST_MANAGER_CONTEXT, UmbBlockListValueModel } from "@umbraco-cms/backoffice/block-list";
import { UMB_CONTENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/content";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";

const elementName = "block-list-preview";

@customElement(elementName)
export class BlockListPreviewCustomView extends BlockPreviewBaseElement<BlockListContext> {

    #previewRepository: PreviewRepository;

    constructor() {
        super();
        this.#previewRepository = new PreviewRepository(this);
    }

    protected _blockContext: BlockListContext = {
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
    private _blockListValue: UmbBlockListValueModel = {
        layout: {},
        expose: [],
        contentData: [],
        settingsData: []
    };

    @property({ attribute: false })
    public set blockListValue(value: UmbBlockListValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockListValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        buildUpValue.expose ??= [];
        this._blockListValue = buildUpValue as UmbBlockListValueModel;
    }

    public get blockListValue(): UmbBlockListValueModel {
        return this._blockListValue;
    }

    protected async setupContextObservers() {
        this.observeSortMode();
        this.observePropertyDataset();
        await this.#observeContentWorkspace();
    }

    async #observeContentWorkspace() {
        try {
            await this.getContext(UMB_CONTENT_WORKSPACE_CONTEXT);

            this.consumeContext(UMB_CONTENT_WORKSPACE_CONTEXT, (context) => {
                if (!context) return;

                this.observe(
                    observeMultiple([context.unique, context.structure.contentTypeUniques]),
                    async ([unique, contentTypeUniques]) => {
                        await this.handleWorkspaceData(unique?.toString(), contentTypeUniques?.[0]);
                    }
                );
            });
        } catch {
            this.observeBlockWorkspaceFallback();
        }
    }

    protected observeBlockValue() {
        this.consumeContext(UMB_BLOCK_LIST_ENTRY_CONTEXT, (context) => {
            if (context) {
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
                    }
                );
            }
        });
    }

    #observeBlockPropertyValue() {
        this.consumeContext(UMB_BLOCK_LIST_MANAGER_CONTEXT, (context) => {
            if (context) {
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

                        this.blockListValue = {
                            contentData: contents?.filter(x => x.key === this._blockContext.contentUdi) ?? [],
                            settingsData: settings?.filter(x => x.key === this._blockContext.settingsUdi) ?? [],
                            expose: exposes?.filter(x => x.contentKey === this._blockContext.contentUdi) ?? [],
                            layout: {
                                ['Umbraco.BlockList']: layouts?.filter(x => x.contentKey === this._blockContext.contentUdi) ?? []
                            }
                        };

                        this._blockContext.blockIndex = contents?.indexOf(this.blockListValue.contentData[0]);
                    }
                );
            }
        });
    }

    protected async callPreviewApi() {
        return await this.#previewRepository.previewListBlock(
            JSON.stringify(this.blockListValue),
            {
                blockEditorAlias: this._blockContext.blockEditorAlias,
                nodeKey: this._blockContext.unique,
                contentElementAlias: this._blockContext.contentElementTypeAlias,
                documentTypeUnique: this._blockContext.documentTypeUnique,
                contentUdi: this._blockContext.contentUdi,
                settingsUdi: this._blockContext.settingsUdi,
                culture: this._blockContext.culture,
                blockIndex: this._blockContext.blockIndex,
            }
        );
    }

    protected async fetchStylesheets() {
        const { data } = await this.#previewRepository.getListStylesheets({
            documentTypeUnique: this._blockContext.documentTypeUnique,
            nodeKey: this._blockContext.unique
        });
        return data;
    }

    protected override validatePreviewData(): boolean {
        return super.validatePreviewData() && this._blockContext.contentUdi !== '';
    }

    protected override renderSortModeFallback() {
        return html`<umb-ref-list-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settings}>
            </umb-ref-list-block>
        `;
    }

    static override styles = [
        ...BlockPreviewBaseElement.styles,
        css`
            :host {
                display: block;
                height: 100%;
            }

            a.block-preview-edit {
                height: 100%;
            }
        `
    ]
}

export default BlockListPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockListPreviewCustomView;
    }
}
