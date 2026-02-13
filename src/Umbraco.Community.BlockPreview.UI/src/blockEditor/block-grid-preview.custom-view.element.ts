import { BlockPreviewService } from "../api";
import BlockPreviewContext from '../context/block-preview.context';
import { BLOCK_PREVIEW_CONTEXT } from "../context/block-preview.context-token";
import { BlockGridContext } from './types';
import { css, customElement, html, ifDefined, property, PropertyValueMap, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT, UmbBlockDataType } from '@umbraco-cms/backoffice/block';
import type { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from '@umbraco-cms/backoffice/block-custom-view';
import { UMB_BLOCK_GRID_ENTRY_CONTEXT, UMB_BLOCK_GRID_MANAGER_CONTEXT, UmbBlockGridLayoutModel, UmbBlockGridValueModel, UmbBlockGridLayoutAreaItemModel } from "@umbraco-cms/backoffice/block-grid";
import { UMB_CONTENT_WORKSPACE_CONTEXT, type UmbContentWorkspaceContext } from "@umbraco-cms/backoffice/content";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { tryExecute, UmbApiError } from "@umbraco-cms/backoffice/resources";
import { UUIButtonElement } from '@umbraco-cms/backoffice/external/uui';

const elementName = "block-grid-preview";

@customElement(elementName)
export class BlockGridPreviewCustomView
    extends UmbLitElement
    implements UmbBlockEditorCustomViewElement {

    #blockPreviewContext?: BlockPreviewContext;
    #contentWorkspaceContext?: UmbContentWorkspaceContext;

    @property({ attribute: false })
    content?: UmbBlockDataType;

    @property({ attribute: false })
    settings?: UmbBlockDataType;

    @property({ attribute: false })
    contentKey?: string;

    @property({ attribute: false })
    config?: UmbBlockEditorCustomViewConfiguration;

    @property({ attribute: false })
    unpublished?: boolean;

    @property({ attribute: false })
    icon?: string;

    @property({ attribute: false })
    label?: string;

    @state()
    private _htmlMarkup: string = '';

    @state()
    private _isLoading: boolean = false;

    @state()
    private _error: string | null = null;

    private _styleElements: HTMLLinkElement[] = [];

    private _previewTimeout: number | undefined;

    private _requestId: number = 0;

    private _isConnected: boolean = false;

    @state()
    private _sortModeActive: boolean = false;

    private _blockContext: BlockGridContext = {
        unique: "",
        documentTypeUnique: "",
        contentUdi: "",
        settingsUdi: "",
        blockEditorAlias: "",
        culture: "",
        workspaceEditContentPath: "",
        contentElementTypeAlias: "",
        contentElementTypeKey: "",
        areas: [],
        layout: undefined,
        layoutAreas: undefined,
        blockIndex: 0
    };

    private _blockGridValue: UmbBlockGridValueModel = {
        layout: {},
        expose: [],
        contentData: [],
        settingsData: []
    }

    @property({ attribute: false })
    public set blockGridValue(value: UmbBlockGridValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockGridValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        buildUpValue.expose ??= [];
        this._blockGridValue = buildUpValue as UmbBlockGridValueModel;
    }
    public get blockGridValue(): UmbBlockGridValueModel {
        return this._blockGridValue;
    }

    constructor() {
        super();
        this.consumeContext(BLOCK_PREVIEW_CONTEXT, async (context) => {
            this.#blockPreviewContext = context;
            await this.#setupContextObservers();
        });
    }

    override connectedCallback() {
        super.connectedCallback();
        this._isConnected = true;
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this._isConnected = false;
        if (this._previewTimeout) {
            clearTimeout(this._previewTimeout);
            this._previewTimeout = undefined;
        }
    }

    protected override updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.updated(_changedProperties);
        if (_changedProperties.has('content') || _changedProperties.has('settings')) {
            if (this._previewTimeout) {
                clearTimeout(this._previewTimeout);
            }
            this._previewTimeout = window.setTimeout(() => {
                this.#renderBlockPreview();
            }, 500);
        }
    }

    async #setupContextObservers() {
        this.#observeSortMode();
        this.#observePropertyDataset();
        await this.#observeContentWorkspace();
    }

    #observeSortMode() {
        this.observe(this.#blockPreviewContext?.sortModeActive, (isActive) => {
            if (isActive !== undefined) {
                this._sortModeActive = isActive;
            }
        });
    }

    #observePropertyDataset() {
        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {
            if (instance) {
                this._blockContext.culture = instance.getVariantId().culture ?? "";
            }
        });
    }

    async #observeContentWorkspace() {
        try {
            await this.getContext(UMB_CONTENT_WORKSPACE_CONTEXT);
            this.consumeContext(UMB_CONTENT_WORKSPACE_CONTEXT, (context) => {
                if (!context)
                    return;

                this.#contentWorkspaceContext = context;
                this.observe(
                    observeMultiple([context.unique, context.structure.contentTypeUniques]),
                    async ([unique, contentTypeUniques]) => {
                        const documentTypeUnique = contentTypeUniques?.[0];

                        // Early exit if disconnected or missing required data
                        if (!this._isConnected || !documentTypeUnique) {
                            return;
                        }

                        this._blockContext.unique = unique?.toString() ?? '';
                        this.#blockPreviewContext?.setUnique(this._blockContext.unique);
                        this._blockContext.documentTypeUnique = documentTypeUnique;
                        this.#blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique);
                        this.#observeBlockValue();

                        const { data } = await tryExecute(this, BlockPreviewService.getGridStylesheets({
                            query: {
                                documentTypeUnique: this._blockContext.documentTypeUnique,
                                nodeKey: this._blockContext.unique
                            }
                        }));
                        if (data && data.length > 0) {
                            this._styleElements = data.map(href => {
                                const link = document.createElement('link');
                                link.rel = 'stylesheet';
                                link.href = href;
                                return link;
                            });
                        }
                    }
                );
            });
        } catch (ex) {
            if (this.#contentWorkspaceContext == null && this.#blockPreviewContext != null && this._blockContext.unique == '') {
                this.consumeContext(UMB_BLOCK_WORKSPACE_CONTEXT, async (context) => {
                    if (context) {
                        this.observe(context.content.structure.contentTypeUniques, async (contentTypeUniques) => {
                            const documentTypeUnique = contentTypeUniques[0];

                            // Early exit if disconnected or missing required data
                            if (!this._isConnected || !documentTypeUnique) {
                                return;
                            }

                            // Try to get unique from context, then fallback to extraction
                            this._blockContext.unique = this.#blockPreviewContext?.getUnique() ?? '';
                            if (!this._blockContext.unique && this._blockContext.workspaceEditContentPath) {
                                this._blockContext.unique = this.#extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath);
                            }

                            this._blockContext.documentTypeUnique = documentTypeUnique;
                            this.#observeBlockValue();

                            const { data } = await tryExecute(this, BlockPreviewService.getGridStylesheets({
                                query: {
                                    documentTypeUnique: this._blockContext.documentTypeUnique,
                                    nodeKey: this._blockContext.unique
                                }
                            }));
                            if (data && data.length > 0) {
                                this._styleElements = data.map(href => {
                                    const link = document.createElement('link');
                                    link.rel = 'stylesheet';
                                    link.href = href;
                                    return link;
                                });
                            }
                        });
                    }
                });
            }
        }
    }

    async #observeBlockValue() {
        this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, async (context) => {
            if (context) {
                this.observe(
                    observeMultiple([
                        context.contentKey,
                        context.settingsKey,
                        context.workspaceEditContentPath,
                        context.contentElementTypeAlias,
                        context.contentElementTypeKey,
                        context.areas,
                        context.layout,
                        context.layoutAreas
                    ]),
                    async ([
                        contentUdi,
                        settingsUdi,
                        workspaceEditContentPath,
                        contentElementTypeAlias,
                        contentElementTypeKey,
                        areas,
                        layout,
                        layoutAreas
                    ]) => {
                        this._blockContext.contentUdi = contentUdi ?? '';
                        this._blockContext.settingsUdi = settingsUdi ?? '';
                        this._blockContext.workspaceEditContentPath = workspaceEditContentPath ?? '';
                        this._blockContext.contentElementTypeAlias = contentElementTypeAlias ?? '';
                        this._blockContext.contentElementTypeKey = contentElementTypeKey ?? '';
                        this._blockContext.areas = areas;
                        this._blockContext.layout = layout!;
                        this._blockContext.layoutAreas = layoutAreas;

                        await this.#observeBlockPropertyValue();
                    }
                );
            }
        });
    }

    async #observeBlockPropertyValue() {
        this.consumeContext(UMB_BLOCK_GRID_MANAGER_CONTEXT, (context) => {
            if (context) {
                this.observe(
                    observeMultiple([
                        context.contents,
                        context.settings,
                        context.exposes,
                        context.propertyAlias
                    ]),
                    async ([contents, settings, exposes, propertyAlias]) => {
                        this._blockContext.blockEditorAlias = propertyAlias ?? '';
                        this.blockGridValue = {
                            contentData: contents ?? [],
                            settingsData: settings ?? [],
                            expose: exposes ?? [],
                            layout: { ['Umbraco.BlockGrid']: this._filterLayouts() }
                        };
                        this._blockContext.blockIndex = contents.indexOf(this.blockGridValue.contentData[0]);
                    }
                );
            }
        });
    }

    _filterLayouts(): UmbBlockGridLayoutModel[] {
        const areas = this._blockContext.areas.map(area => {
            const model: UmbBlockGridLayoutAreaItemModel = {
                key: area.key,
                items: this._blockContext.layoutAreas?.find(layout => layout.key == area.key)?.items!
            }
            return model;
        });

        const layoutModel: UmbBlockGridLayoutModel[] =
            [
                {
                    areas: areas,
                    columnSpan: this._blockContext.layout?.columnSpan ?? 0,
                    rowSpan: this._blockContext.layout?.rowSpan ?? 0,
                    contentKey: this._blockContext.layout?.contentKey ?? '',
                    settingsKey: this._blockContext.layout?.settingsKey
                }
            ];

        return layoutModel;
    }

    async #renderBlockPreview() {
        if (!this._isConnected) {
            return;
        }

        const context = this._blockContext;

        // Try to get unique from context, then fallback to extraction
        if (this.#blockPreviewContext != null && context.unique == '') {
            context.unique = this.#blockPreviewContext.getUnique();
            if (!context.unique && context.workspaceEditContentPath) {
                context.unique = this.#extractUniqueFromWorkspacePath(context.workspaceEditContentPath);
            }
        }

        if (this.#blockPreviewContext != null && context.documentTypeUnique == '') {
            context.documentTypeUnique = this.#blockPreviewContext.getDocumentTypeUnique();
        }

        const isDataValid = this.#validatePreviewData(context);
        if (!isDataValid) {
            this._error = 'Insufficient data for block preview';
            this._isLoading = false;
            return;
        }

        this._isLoading = true;
        this._error = null;

        const requestId = ++this._requestId;

        try {
            const { data, error } = await this.#blockPreviewContext!.requestQueue.enqueue(() =>
                tryExecute(this, BlockPreviewService.previewGridBlock({
                    body: JSON.stringify(this.blockGridValue), query: {
                        blockEditorAlias: context.blockEditorAlias,
                        nodeKey: context.unique,
                        contentElementAlias: context.contentElementTypeAlias,
                        documentTypeUnique: context.documentTypeUnique,
                        contentUdi: context.contentUdi,
                        settingsUdi: context.settingsUdi,
                        culture: context.culture,
                        blockIndex: context.blockIndex
                    }
                }))
            );

            if (this._requestId !== requestId) return;

            if (data != null) {
                this._htmlMarkup = data;
                this._isLoading = false;
            }
            else if (error) {
                this._error = UmbApiError.isUmbApiError(error) ? error.message : 'An error occurred rendering the block preview';
                this._isLoading = false;
            }
            else {
                this._isLoading = false;
            }
        } catch (error) {
            if (this._requestId !== requestId) return;
            this._error = 'Failed to render block preview';
            this._isLoading = false;
            console.error('Block preview error:', error);
        }
    }

    #validatePreviewData(context: typeof this._blockContext): boolean {
        return !!(
            context.unique != '' &&
            context.blockEditorAlias != '' &&
            context.contentUdi != '' &&
            context.contentElementTypeAlias != ''
        );
    }

    #extractUniqueFromWorkspacePath(path: string): string {
        // Extract the document unique from the workspace edit path
        // Pattern: /workspace/document/edit/{unique}/
        const match = path.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
        return match ? match[1] : '';
    }

    _handleClick(event: PointerEvent) {
        const path = event.composedPath();

        // Block clicks that originate from the overlay expose button, which is
        // rendered as a sibling to this element when the block is not yet exposed.
        if (path.some(x => x instanceof Element && x.tagName === 'UMB-BLOCK-OVERLAY-EXPOSE-BUTTON')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Check for clicks on action bars or resize handlers.
        const interactiveElements = ['UUI-ACTION-BAR', 'UMB-BLOCK-SCALE-HANDLER'];
        if (path.some(x => x instanceof Element && interactiveElements.includes(x.tagName))) {
            // Allow edit button clicks through — the <a> tag handles navigation.
            const editButton = path.find(x => x instanceof UUIButtonElement && x.href?.includes('block/edit'));
            if (editButton) {
                return;
            }

            // Block all other action bar clicks (delete, copy, etc.) to prevent
            // the parent block's <a> from navigating when interacting with
            // child blocks inside areas.
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Handle custom links within the preview
        const containsLink = path.filter(x => x instanceof Element && x.tagName === 'A' && x.hasAttribute('data-block-preview-link')) as Element[];
        if (containsLink.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            const blockPreviewEdit = path.find(x => x instanceof Element && x.tagName === 'A' && x.classList.contains('block-preview-edit'));
            if (blockPreviewEdit instanceof Element) {
                window.history.pushState({}, '', blockPreviewEdit.getAttribute('href'));
            } else {
                window.history.pushState({}, '', this._blockContext.workspaceEditContentPath);
            }
            return;
        }

        // All other clicks fall through to the <a> element's default behavior,
        // which navigates to this block's edit workspace.
    }

    override render() {
        if (this._sortModeActive === false) {
            if (this._isLoading) {
                return html`<div class="preview-alert preview-alert-info"><uui-loader style="color: #fff"></uui-loader> Loading preview...</div>`;
            }

            if (this._error) {
                return html`
                    <div class="preview-alert preview-alert-error" role="alert">
                        ${this._error}
                    </div>
                `;
            }

            if (this._htmlMarkup) {
                return html`
                    ${this._styleElements}
                     <a
                         href=${ifDefined(this._blockContext.workspaceEditContentPath)}
                         @click=${this._handleClick}
                         aria-label="Edit block"
                         class="block-preview-edit"
                         role="button"
                     >
                        ${unsafeHTML(this._htmlMarkup)}
                    </a>
                `;
            }
        }

        else return html`<umb-block-grid-block
            class="umb-block-grid__block--view"
            .label=${this.label}
            .icon=${this.icon}
            .unpublished=${this.unpublished}
            .config=${this.config}
            .content=${this.content}
            .settings=${this.settings}>
            </umb-block-grid-block>
        `;
    }

    static styles = [
        css`
      :host {
        display: block;
        height: 100%;
      }

      a.block-preview-edit {
        display: block;
        height: 100%;
        color: inherit;
        text-decoration: inherit;
        border:1px solid transparent;
        border-radius:2px;
      }

      a.block-preview-edit:hover {
        border-color: var(--uui-color-interactive-emphasis, #3544b1);
      }

      .preview-alert {
        background-color: var(--uui-color-danger, #f0ac00);
        border:1px solid transparent;
        border-radius:0;
        margin-bottom:20px;
        padding:8px 35px 8px 14px;
        position: relative;

        &, a, h4 {
          color: #fff;
        }

        pre {
          white-space: normal;
        }

        uui-loader {
          margin-right:16px;
        }
      }

      .preview-alert-warning {
        background-color: var(--uui-color-warning, #f0ac00);
        border-color: transparent;
        color: #000;
      }

      .preview-alert-info {
        background-color: var(--uui-color-default, #3544b1);
        border-color: transparent;
        color: #fff;
      }

      .preview-alert-danger,
      .preview-alert-error {
        background-color: var(--uui-color-danger, #f0ac00);
        border-color: transparent;
        color: #fff;
      }
    `
    ]
}

export default BlockGridPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockGridPreviewCustomView;
    }
}