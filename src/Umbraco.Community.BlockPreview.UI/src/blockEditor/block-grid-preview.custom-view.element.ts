import { UMB_BLOCK_GRID_ENTRY_CONTEXT, UmbBlockGridValueModel } from "@umbraco-cms/backoffice/block-grid";
import { UmbContentTypeModel } from "@umbraco-cms/backoffice/content-type";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/extension-registry";
import { css, customElement, html, ifDefined, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";
import { BlockPreviewService, PreviewGridBlockData } from "../api";
import { BLOCK_PREVIEW_CONTEXT } from "../context/block-preview.context-token";

const elementName = "block-grid-preview";

@customElement(elementName)
export class BlockGridPreviewCustomView
    extends UmbLitElement
    implements UmbBlockEditorCustomViewElement {

    _styleElement?: HTMLLinkElement;

    @state()
    htmlMarkup: string | undefined = '';

    unique?: string = '';
    documentTypeUnique?: string = '';
    contentUdi: string | undefined = '';
    settingsUdi: string | undefined | null = null;
    blockEditorAlias?: string = '';
    culture?: string = '';
    workspaceEditContentPath?: string;
    contentElementType: UmbContentTypeModel | undefined;

    private _blockGridValue: UmbBlockGridValueModel = {
        layout: {},
        contentData: [],
        settingsData: []
    }

    @property({ attribute: false })
    public set blockGridValue(value: UmbBlockGridValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockGridValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        this._blockGridValue = buildUpValue as UmbBlockGridValueModel;
    }
    public get blockGridValue(): UmbBlockGridValueModel {
        return this._blockGridValue;
    }

    constructor() {
        super();

        this.consumeContext(BLOCK_PREVIEW_CONTEXT, async (context) => {
            this.observe(context.settings, (settings) => {
                if (settings?.blockGrid?.stylesheet) {
                    this._styleElement = document.createElement('link');
                    this._styleElement.rel = 'stylesheet';
                    this._styleElement.href = settings?.blockGrid?.stylesheet as string;
                }
            });
        });

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (instance) => {
            this.culture = instance.getVariantId().culture ?? "";
        });

        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.unique, context.contentTypeUnique]),
                async ([unique, documentTypeUnique]) => {
                    this.unique = unique;
                    this.documentTypeUnique = documentTypeUnique;
                    this.#observeBlockGridValue();
                });
        });
    }

    #observeBlockGridValue(): void {
        this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.alias, context.value]),
                async ([alias, value]) => {
                    this.blockEditorAlias = alias;

                    this.blockGridValue = {
                        ...this.blockGridValue,
                        contentData: value.contentData!,
                        settingsData: value.settingsData!,
                        layout: value.layout!
                    }

                    this.#observeBlockValue();
                });
        });
    }

    #observeBlockValue(): void {
        this.consumeContext(UMB_BLOCK_GRID_ENTRY_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.contentUdi, context.settingsUdi, context.workspaceEditContentPath, context.contentElementType]),
                async ([contentUdi, settingsUdi, workspaceEditContentPath, contentElementType]) => {
                    this.contentUdi = contentUdi;
                    this.settingsUdi = settingsUdi ?? undefined;
                    this.contentElementType = contentElementType;
                    this.workspaceEditContentPath = workspaceEditContentPath;

                    await this.#renderBlockPreview();
                });
        });
    }

    async #renderBlockPreview() {
        if (!this.unique ||
            !this.documentTypeUnique ||
            !this.blockEditorAlias ||
            !this.contentUdi ||
            !this.contentElementType ||
            this.settingsUdi === null ||
            !this.blockGridValue.contentData ||
            !this.blockGridValue.layout)
            return;

        const previewData: PreviewGridBlockData = {
            blockEditorAlias: this.blockEditorAlias,
            nodeKey: this.unique,
            contentElementAlias: this.contentElementType.alias,
            documentTypeUnique: this.documentTypeUnique,
            contentUdi: this.contentUdi,
            settingsUdi: this.settingsUdi,
            culture: this.culture,
            requestBody: JSON.stringify(this.blockGridValue)
        };

        const { data } = await tryExecuteAndNotify(this, BlockPreviewService.previewGridBlock(previewData));

        if (data) {
            this.htmlMarkup = data;
        }
    }

    render() {
        if (this.htmlMarkup !== "") {
            return html`
                ${this._styleElement}
                <a href=${ifDefined(this.workspaceEditContentPath)}>
                    ${unsafeHTML(this.htmlMarkup)}
                </a>`;
        }
        return;
    }

    static styles = [
        css`
            a {
              display: block;
              color: inherit;
              text-decoration: inherit;
              border: 1px solid transparent;
              border-radius: 2px;
            }

            a:hover {
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

export default BlockGridPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockGridPreviewCustomView;
    }
}
