import BlockPreviewContext from '../context/block-preview.context';
import { BLOCK_PREVIEW_CONTEXT } from '../context/block-preview.context-token';
import { BlockContext } from './types';
import { css, html, ifDefined, nothing, property, PropertyValueMap, state, unsafeHTML } from '@umbraco-cms/backoffice/external/lit';
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

    /**
     * The content type that *owns* the block-editor property this preview belongs
     * to, when the preview is nested inside another block. Empty for top-level
     * previews. When set, it takes precedence over the document content type as
     * `documentTypeUnique`. See {@link observeOwnerContentType}.
     */
    protected _ownerContentTypeUnique: string = '';

    @property({ attribute: false, hasChanged: (val: any, old: any) => JSON.stringify(val) !== JSON.stringify(old) })
    content?: UmbBlockDataType;

    @property({ attribute: false, hasChanged: (val: any, old: any) => JSON.stringify(val) !== JSON.stringify(old) })
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

    protected _stylesheetsAdopted: boolean = false;

    protected _requestId: number = 0;

    protected _isConnected: boolean = false;

    /** Tracks pointerdown position on the <a> tag to distinguish clicks from drags. */
    private _pointerStartPos: { x: number; y: number } | null = null;

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
            this.observeOwnerContentType();
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
    }

    protected override updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.updated(_changedProperties);
        if (_changedProperties.has('content') || _changedProperties.has('settings')) {
            this.renderBlockPreview();
        }
    }

    // region Shared context observers

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

        // `documentTypeUnique` here is the *document's* content type, because the
        // workspace lookup deliberately reaches past the nearest block workspace to
        // the document (needed for the node key — see #297/#298). When this preview
        // is nested, the owning content type is the parent element type instead, so
        // prefer the owner resolved by observeOwnerContentType() when available.
        this._blockContext.documentTypeUnique = this._ownerContentTypeUnique || documentTypeUnique;
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

    /**
     * Resolves the content type that *owns* the block-editor property, i.e. the one
     * the server must look the property up on (`documentTypeUnique`).
     *
     * When a preview is nested inside another block, the block-editor property it
     * belongs to is defined on the parent *element type*, not on the document.
     * handleWorkspaceData() reaches past the nearest block workspace to the document
     * workspace to resolve the node key (see #297/#298), so on its own it reports the
     * *document's* content type — and the server then fails to find the property,
     * returning "The property type is invalid." for every nested block.
     *
     * The nearest block workspace, when present, exposes exactly the owning element
     * type. Observe it and treat its content type as the authoritative
     * `documentTypeUnique`. Top-level previews have no block workspace, so this never
     * fires and the document content type from handleWorkspaceData() stands.
     */
    protected observeOwnerContentType() {
        this.consumeContext(UMB_BLOCK_WORKSPACE_CONTEXT, (context) => {
            if (!context) {
                return;
            }

            this.observe(context.content.structure.contentTypeUniques, (contentTypeUniques) => {
                const owner = contentTypeUniques?.[0];
                if (!owner || owner === this._ownerContentTypeUnique) {
                    return;
                }

                this._ownerContentTypeUnique = owner;
                this._blockContext.documentTypeUnique = owner;

                // If the preview already resolved (and possibly rendered) using the
                // document's content type, re-fetch stylesheets and re-render now that
                // the owning element type is known.
                if (this._workspaceContextResolved) {
                    this._stylesheetsAdopted = false;
                    void this.fetchAndLoadStylesheets();
                    void this.renderBlockPreview();
                }
            });
        });
    }

    protected async fetchAndLoadStylesheets() {
        if (this._stylesheetsAdopted || !this._blockPreviewContext) return;
        const data = await this.fetchStylesheets();
        if (data && data.length > 0) {
            const sheets = await Promise.all(
                data.map(href => this._blockPreviewContext!.getOrCreateStylesheet(href))
            );
            const shadowRoot = this.renderRoot as ShadowRoot;
            shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ...sheets];
            this._stylesheetsAdopted = true;
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

    protected _handlePointerDown(event: PointerEvent) {
        this._pointerStartPos = { x: event.clientX, y: event.clientY };
    }

    protected _handleClick(event: PointerEvent) {
        // Detect drag/resize interactions: if the pointer moved significantly between
        // pointerdown and click, suppress the navigation. This prevents the edit modal
        // from opening when the user finishes resizing a grid block.
        const pointerType = 'pointerType' in event ? (event as PointerEvent).pointerType : '';
        if (pointerType !== '') {
            if (!this._pointerStartPos) {
                // Pointer click with no corresponding pointerdown on this element —
                // likely a resize/drag that ended over our <a> tag.
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            const dx = Math.abs(event.clientX - this._pointerStartPos.x);
            const dy = Math.abs(event.clientY - this._pointerStartPos.y);
            this._pointerStartPos = null;
            if (dx > 5 || dy > 5) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        this._pointerStartPos = null;

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

    override render() {
        return html`
            ${this._isLoading
                ? html`<div class="preview-alert preview-alert-info"><uui-loader></uui-loader> <umb-localize key="blockPreview_loading">Loading preview...</umb-localize></div>`
                : this._error
                    ? html`<div class="preview-alert preview-alert-error" role="alert">${this._error}</div>`
                    : this._htmlMarkup
                        ? html`<a
                            href=${ifDefined(this._blockContext.workspaceEditContentPath)}
                            @pointerdown=${this._handlePointerDown}
                            @click=${this._handleClick}
                            aria-label=${this.localize.term('blockPreview_editBlock')}
                            class="block-preview-edit"
							title=${ifDefined(this._blockContext.contentElementTypeAlias)}
                        >${unsafeHTML(this._htmlMarkup)}</a>`
                        : nothing}
        `;
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
