import BlockPreviewContext from '../context/block-preview.context';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockContext } from './types';
import { css, html, ifDefined, property, PropertyValueMap, state, unsafeHTML, type TemplateResult } from '@umbraco-cms/backoffice/external/lit';
import { UMB_BLOCK_WORKSPACE_CONTEXT, UmbBlockDataType } from '@umbraco-cms/backoffice/block';
import type { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from '@umbraco-cms/backoffice/block-custom-view';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UmbApiError } from '@umbraco-cms/backoffice/resources';
import { UUIButtonElement } from '@umbraco-cms/backoffice/external/uui';

/**
 * Abstract base class for block preview custom view elements.
 * Extracts shared behavior (lifecycle, rendering, click handling, validation,
 * context observation helpers, and CSS) so that block-type-specific subclasses
 * only implement the parts that differ.
 */
export abstract class BlockPreviewBaseElement<TContext extends BlockContext = BlockContext>
    extends UmbLitElement
    implements UmbBlockEditorCustomViewElement {

    protected _blockPreviewContext?: BlockPreviewContext;
    protected _workspaceContextResolved: boolean = false;

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
    protected _htmlMarkup: string = '';

    @state()
    protected _isLoading: boolean = false;

    @state()
    protected _error: string | null = null;

    @state()
    protected _sortModeActive: boolean = false;

    protected _styleElements: HTMLLinkElement[] = [];

    protected _previewTimeout: number | undefined;

    protected _requestId: number = 0;

    protected _isConnected: boolean = false;

    /** Subclass provides a concrete block context object with block-type-specific fields. */
    protected abstract _blockContext: TContext;

    /** Set up all context observers (sort mode, property dataset, workspace). */
    protected abstract setupContextObservers(): Promise<void> | void;

    /** Observe the block entry context for content/settings keys and element type info. */
    protected abstract observeBlockValue(): void;

    /** Call the appropriate BlockPreviewService API method and return the result. */
    protected abstract callPreviewApi(): Promise<{ data?: string | null; error?: unknown }>;

    /** Fetch stylesheet paths from the appropriate BlockPreviewService endpoint. */
    protected abstract fetchStylesheets(): Promise<string[] | undefined>;

    constructor() {
        super();
        this.consumeContext(BLOCK_PREVIEW_CONTEXT, async (context) => {
            this._blockPreviewContext = context;
            await this.setupContextObservers();
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
                this.renderBlockPreview();
            }, 500);
        }
    }

    // region Shared context observers

    protected observeSortMode() {
        this.observe(this._blockPreviewContext?.sortModeActive, (isActive) => {
            if (isActive !== undefined) {
                this._sortModeActive = isActive;
            }
        });
    }

    protected observePropertyDataset() {
        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (instance) => {
            if (instance) {
                this._blockContext.culture = instance.getVariantId().culture ?? '';
            }
        });
    }

    // endregion

    // region Workspace helpers

    /**
     * Shared handler called once the workspace context provides a unique + documentTypeUnique.
     * Sets up block context, triggers block value observation, and loads stylesheets.
     */
    protected async handleWorkspaceData(unique: string | undefined, documentTypeUnique: string | undefined) {
        if (!this._isConnected || !documentTypeUnique) {
            return;
        }

        this._blockContext.unique = unique?.toString() ?? '';
        this._blockPreviewContext?.setUnique(this._blockContext.unique);

        this._blockContext.documentTypeUnique = documentTypeUnique;
        this._blockPreviewContext?.setDocumentTypeUnique(this._blockContext.documentTypeUnique);
        this._workspaceContextResolved = true;

        this.observeBlockValue();
        await this.fetchAndLoadStylesheets();
    }

    /**
     * Fallback workspace observation via UMB_BLOCK_WORKSPACE_CONTEXT.
     * Used when the primary workspace context is unavailable (e.g. nested block editing).
     */
    protected observeBlockWorkspaceFallback() {
        if (this._workspaceContextResolved || !this._blockPreviewContext || this._blockContext.unique !== '') {
            return;
        }

        this.consumeContext(UMB_BLOCK_WORKSPACE_CONTEXT, async (context) => {
            if (context) {
                this.observe(context.content.structure.contentTypeUniques, async (contentTypeUniques) => {
                    const documentTypeUnique = contentTypeUniques[0];
                    if (!this._isConnected || !documentTypeUnique) {
                        return;
                    }

                    // Try to get unique from context, then fallback to extraction
                    this._blockContext.unique = this._blockPreviewContext?.getUnique() ?? '';
                    if (!this._blockContext.unique && this._blockContext.workspaceEditContentPath) {
                        this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath);
                    }

                    this._blockContext.documentTypeUnique = documentTypeUnique;
                    this.observeBlockValue();
                    await this.fetchAndLoadStylesheets();
                });
            }
        });
    }

    protected async fetchAndLoadStylesheets() {
        const data = await this.fetchStylesheets();
        if (data && data.length > 0) {
            this._styleElements = data.map(href => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                return link;
            });
        }
    }

    // endregion

    // region Preview rendering

    protected resolveUniqueFromContext() {
        if (this._blockPreviewContext != null && this._blockContext.unique === '') {
            this._blockContext.unique = this._blockPreviewContext.getUnique();
            if (!this._blockContext.unique && this._blockContext.workspaceEditContentPath) {
                this._blockContext.unique = this.extractUniqueFromWorkspacePath(this._blockContext.workspaceEditContentPath);
            }
        }
        if (this._blockPreviewContext != null && this._blockContext.documentTypeUnique === '') {
            this._blockContext.documentTypeUnique = this._blockPreviewContext.getDocumentTypeUnique();
        }
    }

    protected async renderBlockPreview() {
        if (!this._isConnected) {
            return;
        }

        this.resolveUniqueFromContext();

        if (!this.validatePreviewData()) {
            this._error = this.localize.term('blockPreview_insufficientData');
            this._isLoading = false;
            return;
        }

        this._isLoading = true;
        this._error = null;

        const requestId = ++this._requestId;

        try {
            const { data, error } = await this._blockPreviewContext!.requestQueue.enqueue(() =>
                this.callPreviewApi()
            );

            if (this._requestId !== requestId) return;

            if (data != null) {
                this._htmlMarkup = data;
                this._isLoading = false;
            }
            else if (error) {
                this._error = UmbApiError.isUmbApiError(error) ? error.message : this.localize.term('blockPreview_renderError');
                this._isLoading = false;
            }
            else {
                this._isLoading = false;
            }
        } catch (error) {
            if (this._requestId !== requestId) return;
            this._error = this.localize.term('blockPreview_renderFailed');
            this._isLoading = false;
            console.error('Block preview error:', error);
        }
    }

    /**
     * Validates that sufficient data is available for a preview request.
     * Subclasses may override to add additional checks (e.g. contentUdi).
     */
    protected validatePreviewData(): boolean {
        const context = this._blockContext;
        return !!(
            context.unique !== '' &&
            context.blockEditorAlias !== '' &&
            context.contentElementTypeAlias !== ''
        );
    }

    // endregion

    // region Utilities

    protected extractUniqueFromWorkspacePath(path: string): string {
        // Extract the document unique from the workspace edit path
        // Pattern: /workspace/document/edit/{unique}/
        const match = path.match(/\/workspace\/document\/edit\/([a-f0-9-]{36})/i);
        return match ? match[1] : '';
    }

    protected _handleClick(event: PointerEvent) {
        const path = event.composedPath();

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

    // endregion

    // region Rendering

    /**
     * Override in subclasses that support sort mode (grid, list) to provide a
     * fallback element when sort mode is active.
     */
    protected renderSortModeFallback(): TemplateResult | undefined {
        return undefined;
    }

    override render() {
        if (this._sortModeActive) {
            return this.renderSortModeFallback();
        }

        if (this._isLoading) {
            return html`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>`;
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
                    aria-label=${this.localize.term('blockPreview_editBlock')}
                    class="block-preview-edit"
                    data-description=${ifDefined(this._blockContext.contentElementTypeAlias)}
                >
                    ${unsafeHTML(this._htmlMarkup)}
                </a>
            `;
        }
    }

    // endregion

    static styles = [
        css`
            a.block-preview-edit {
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
                border: 1px solid transparent;
                border-radius: 0;
                margin-bottom: 20px;
                padding: 8px 35px 8px 14px;
                position: relative;

                &, a, h4 {
                    color: #fff;
                }

                pre {
                    white-space: normal;
                }

                uui-loader {
                    color: #fff;
                    margin-right: 16px;
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

            .preview-alert-danger, .preview-alert-error {
                background-color: var(--uui-color-danger, #f0ac00);
                border-color: transparent;
                color: #fff;
            }
        `
    ]
}
