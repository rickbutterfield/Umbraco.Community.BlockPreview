import { BlockPreviewService } from "../api";
import BlockPreviewContext from '../context/block-preview.context';
import { BLOCK_PREVIEW_CONTEXT } from "../context/block-preview.context-token";
import { BlockGridContext } from './types';
import { css, customElement, html, ifDefined, property, PropertyValues, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UMB_BLOCK_WORKSPACE_CONTEXT, UmbBlockDataType } from '@umbraco-cms/backoffice/block';
import type { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from '@umbraco-cms/backoffice/block-custom-view';
import { UMB_BLOCK_GRID_ENTRY_CONTEXT, UMB_BLOCK_GRID_MANAGER_CONTEXT, UmbBlockGridLayoutModel, UmbBlockGridValueModel, UmbBlockGridLayoutAreaItemModel } from "@umbraco-cms/backoffice/block-grid";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT, UmbDocumentWorkspaceContext } from "@umbraco-cms/backoffice/document";
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
    #documentWorkspaceContext?: UmbDocumentWorkspaceContext;

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

    @state()
    private _columnSpan: number = 0;

    @state()
    private _rowSpan: number = 0;

    private _styleElement?: HTMLLinkElement;

    @state()
    private _isFirstLoad: boolean = false;

    @state()
    private _sortModeActive: boolean = false;

    private _pointerDownPos: { x: number; y: number } | null = null;
    private _isDragging: boolean = false;

    // Track element instance creation with unique ID
    private readonly _instanceId: string = `${elementName}-${Math.random().toString(36).substr(2, 9)}`;
    private _connectionCount: number = 0;

    @state()
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

        console.log(`[${this._instanceId}] Constructor called - NEW INSTANCE CREATED`);

        this.consumeContext(BLOCK_PREVIEW_CONTEXT, async (context) => {
            this.#blockPreviewContext = context;
            await this.#setupContextObservers();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this._connectionCount++;
        console.log(`[${this._instanceId}] connectedCallback #${this._connectionCount} - Element CONNECTED to DOM`);
        this._isFirstLoad = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        console.log(`[${this._instanceId}] disconnectedCallback - Element DISCONNECTED from DOM (connection count was: ${this._connectionCount})`);
    }

    protected override willUpdate(_changedProperties: PropertyValues): void {
        if (!this._isFirstLoad && !_changedProperties.has('_isFirstLoad') && !_changedProperties.has('_isLoading')) {
            if (
                (_changedProperties.has('content') && this.content) ||
                (_changedProperties.has('settings') && this.settings)) {
                console.log(`[${this._instanceId}] willUpdate - Re-rendering due to content/settings change`, {
                    contentChanged: _changedProperties.has('content'),
                    settingsChanged: _changedProperties.has('settings')
                });
                debugger;
                this.#renderBlockPreview();
            }

            if (_changedProperties.has('blockGridValue') ||
                (_changedProperties.has('_columnSpan') && this._columnSpan) ||
                (_changedProperties.has('_rowSpan') && this._rowSpan)) {
                const value = _changedProperties.get('blockGridValue') as UmbBlockGridValueModel | undefined;
                if (value) {
                    const layouts = value.layout ? value.layout['Umbraco.BlockGrid'] : undefined;
                    if (layouts) {
                        const newColumnSpan = this._getColumnSpan(layouts);
                        const newRowSpan = this._getRowSpan(layouts);

                        if (newColumnSpan !== this._columnSpan || newRowSpan !== this._rowSpan) {
                            console.log(`[${this._instanceId}] willUpdate - Re-rendering due to layout change`, {
                                oldColumnSpan: this._columnSpan,
                                newColumnSpan,
                                oldRowSpan: this._rowSpan,
                                newRowSpan
                            });
                            debugger;
                            this._columnSpan = newColumnSpan;
                            this._rowSpan = newRowSpan;
                            this.#renderBlockPreview();
                        }
                    }
                }
            }
        }

        super.willUpdate(_changedProperties);
    }

    async #setupContextObservers() {
        this.#observeSortMode();
        this.#observeBlockPreviewSettings();
        this.#observePropertyDataset();
        await this.#observeDocumentWorkspace();
        await this.#observeBlockContexts();
    }

    #observeSortMode() {
        this.observe(this.#blockPreviewContext?.sortModeActive, (isActive) => {
            if (isActive !== undefined) {
                this._sortModeActive = isActive;
            }
        });
    }

    #observeBlockPreviewSettings() {
        this.observe(this.#blockPreviewContext?.settings, (settings) => {
            if (settings?.blockGrid?.stylesheet) {
                this._styleElement = document.createElement('link');
                this._styleElement.rel = 'stylesheet';
                this._styleElement.href = settings.blockGrid.stylesheet as string;
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

    async #observeDocumentWorkspace() {
        try {
            await this.getContext(UMB_DOCUMENT_WORKSPACE_CONTEXT);

            this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
                if (!context)
                    return;

                this.#documentWorkspaceContext = context;

                this.observe(
                    observeMultiple([context.unique, context.contentTypeUnique]),
                    async ([unique, documentTypeUnique]) => {
                        this._blockContext.unique = unique?.toString() ?? '';
                        this.#blockPreviewContext?.setUnique(this._blockContext.unique);

                        this._blockContext.documentTypeUnique = documentTypeUnique ?? '';
                        this.#blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique);
                        this.#observeBlockContexts();
                    }
                );

            });
        }
        catch (ex) {
            if (this.#documentWorkspaceContext == null && this.#blockPreviewContext != null && this._blockContext.unique == '') {
                this.consumeContext(UMB_BLOCK_WORKSPACE_CONTEXT, (context) => {
                    if (context) {
                        this.observe(context.content.structure.contentTypeUniques, (contentTypeUniques) => {
                            this._blockContext.unique = this.#blockPreviewContext?.getUnique() ?? '';
                            this._blockContext.documentTypeUnique = contentTypeUniques[0] ?? '';
                            this.#observeBlockContexts();
                        });
                    }
                });
            }
        }
    }

    async #observeBlockContexts() {
        // Consume all contexts first, then observe them together
        this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (entryContext) => {
            if (!entryContext) return;

            this.consumeContext(UMB_BLOCK_GRID_MANAGER_CONTEXT, (managerContext) => {
                if (!managerContext) return;

                // Now observe all properties from both contexts together
                this.observe(
                    observeMultiple([
                        entryContext.contentKey,
                        entryContext.settingsKey,
                        entryContext.workspaceEditContentPath,
                        entryContext.contentElementTypeAlias,
                        entryContext.contentElementTypeKey,
                        entryContext.areas,
                        entryContext.layout,
                        entryContext.layoutAreas,
                        managerContext.contents,
                        managerContext.settings,
                        managerContext.exposes,
                        managerContext.propertyAlias
                    ]),
                    async ([
                        contentUdi,
                        settingsUdi,
                        workspaceEditContentPath,
                        contentElementTypeAlias,
                        contentElementTypeKey,
                        areas,
                        layout,
                        layoutAreas,
                        contents,
                        settings,
                        exposes,
                        propertyAlias
                    ]) => {
                        // Update block context from entry context
                        this._blockContext.contentUdi = contentUdi ?? '';
                        this._blockContext.settingsUdi = settingsUdi ?? '';
                        this._blockContext.workspaceEditContentPath = workspaceEditContentPath ?? '';
                        this._blockContext.contentElementTypeAlias = contentElementTypeAlias ?? '';
                        this._blockContext.contentElementTypeKey = contentElementTypeKey ?? '';
                        this._blockContext.areas = areas;
                        this._blockContext.layout = layout!;
                        this._blockContext.layoutAreas = layoutAreas;

                        // Update block context from manager context
                        this._blockContext.blockEditorAlias = propertyAlias ?? '';

                        const filteredLayouts = this._filterLayouts();

                        // Update block grid value
                        this.blockGridValue = {
                            contentData: contents ?? [],
                            settingsData: settings ?? [],
                            expose: exposes ?? [],
                            layout: { ['Umbraco.BlockGrid']: filteredLayouts }
                        };

                        this._columnSpan = this._getColumnSpan(filteredLayouts);
                        this._rowSpan = this._getRowSpan(filteredLayouts);

                        this._blockContext.blockIndex = contents.indexOf(this.blockGridValue.contentData[0]);
                        if (this._isFirstLoad) {
                            console.log(`[${this._instanceId}] First load complete - rendering block preview`);
                            debugger;
                            this._isFirstLoad = false;
                            this.#renderBlockPreview();
                        }
                    }
                );
            });
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

    _getColumnSpan(layouts?: UmbBlockGridLayoutModel[] | undefined): number {
        if (!layouts || layouts.length === 0) {
            return 0;
        }

        return layouts[0]?.columnSpan ?? 0;
    }

    _getRowSpan(layouts?: UmbBlockGridLayoutModel[] | undefined): number {
        if (!layouts || layouts.length === 0) {
            return 0;
        }

        return layouts[0]?.rowSpan ?? 0;
    }

    async #renderBlockPreview() {
        const context = this._blockContext;
        if (this.#blockPreviewContext != null && context.unique == '') {
            context.unique = this.#blockPreviewContext.getUnique();
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

        try {
            const { data, error } = await tryExecute(this, BlockPreviewService.previewGridBlock({
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
            }));

            this._isLoading = false;

            if (data) {
                this._htmlMarkup = data ?? '';
            }
            else if (UmbApiError.isUmbApiError(error)) {
                this._error = error.message;
            }

        } catch (error) {
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

    _handlePointerDown(event: PointerEvent) {
        this._pointerDownPos = { x: event.clientX, y: event.clientY };
        this._isDragging = false;
    }

    _handlePointerMove(event: PointerEvent) {
        if (this._pointerDownPos) {
            const deltaX = Math.abs(event.clientX - this._pointerDownPos.x);
            const deltaY = Math.abs(event.clientY - this._pointerDownPos.y);
            if (deltaX > 5 || deltaY > 5) {
                this._isDragging = true;
            }
        }
    }

    _handlePointerUp() {
        this._pointerDownPos = null;
        setTimeout(() => {
            this._isDragging = false;
        }, 10);
    }

    _handleClick(event: PointerEvent) {
        if (this._isDragging) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        let blockEvent = true;
        const path = event.composedPath();
        const elements = [
            'UUI-ACTION-BAR',
            'UMB-BLOCK-SCALE-HANDLER'
        ];

        const containsElement = path.filter(x => x instanceof Element && elements.includes(x.tagName));

        if (containsElement.length > 0) {
            const containsEditButton = path.find(x => x instanceof Element && x.tagName === 'UUI-BUTTON');

            if (containsEditButton != null) {
                if (containsEditButton instanceof UUIButtonElement) {
                    if (containsEditButton.href?.includes('block/edit')) {
                        blockEvent = false;
                    }
                }
            }

            if (blockEvent) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
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
                ${this._styleElement}
                <a
                    href=${ifDefined(this._blockContext.workspaceEditContentPath)} 
                    @pointerdown=${this._handlePointerDown}
                    @pointermove=${this._handlePointerMove}
                    @pointerup=${this._handlePointerUp}
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
              height: 100%;
              display: block;
              color: inherit;
              text-decoration: inherit;
              border: 1px solid transparent;
              border-radius: 2px;
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
