import { UMB_BLOCK_LIST_ENTRY_CONTEXT, UmbBlockListValueModel } from "@umbraco-cms/backoffice/block-list";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/extension-registry";
import { css, customElement, html, ifDefined, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { observeMultiple } from "@umbraco-cms/backoffice/observable-api";
import { UMB_PROPERTY_CONTEXT, UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";
import { BlockPreviewService, PreviewListBlockData } from "../api";
import { UmbContentTypeModel } from "@umbraco-cms/backoffice/content-type";

const elementName = "block-list-preview";

@customElement(elementName)
export class BlockListPreviewCustomView
    extends UmbLitElement
    implements UmbBlockEditorCustomViewElement {

    @state()
    htmlMarkup: string | undefined = "";

    unique?: string = '';
    documentTypeUnique?: string = '';
    blockEditorAlias?: string = '';
    culture?: string = '';
    workspaceEditContentPath?: string;
    contentElementType: UmbContentTypeModel | undefined;

    @state()
    private _blockListValue: UmbBlockListValueModel = {
        layout: {},
        contentData: [],
        settingsData: []
    }

    @property({ attribute: false })
    public set blockListValue(value: UmbBlockListValueModel | undefined) {
        const buildUpValue: Partial<UmbBlockListValueModel> = value ? { ...value } : {};
        buildUpValue.layout ??= {};
        buildUpValue.contentData ??= [];
        buildUpValue.settingsData ??= [];
        this._blockListValue = buildUpValue as UmbBlockListValueModel;
    }
    public get blockListValue(): UmbBlockListValueModel {
        return this._blockListValue;
    }

    constructor() {
        super();

        this.consumeContext(UMB_PROPERTY_CONTEXT, (instance) => {
            this.observe(instance.alias, async (alias) => {
                this.blockEditorAlias = alias;
                await this.#renderBlockPreview();
            });
        })

        this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (instance) => {
            this.culture = instance.getVariantId().culture ?? "";
            await this.#renderBlockPreview();
        });

        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.unique, context.contentTypeUnique]),
                async ([unique, documentTypeUnique]) => {
                    this.unique = unique;
                    this.documentTypeUnique = documentTypeUnique;
                });
        });

        this.consumeContext(UMB_BLOCK_LIST_ENTRY_CONTEXT, (context) => {
            this.observe(
                observeMultiple([context.workspaceEditContentPath, context.content, context.settings, context.layout, context.contentElementType]),
                async ([workspaceEditContentPath, content, settings, layout, contentElementType]) => {
                    this.contentElementType = contentElementType;
                    this.workspaceEditContentPath = workspaceEditContentPath;

                    this._blockListValue = {
                        ...this._blockListValue,
                        contentData: [content!],
                        settingsData: [settings!],
                        layout: { ["Umbraco.BlockList"]: [layout!] }
                    }

                    await this.#renderBlockPreview();
                });
        });
    }

    async #renderBlockPreview() {
        if (!this.unique ||
            !this.documentTypeUnique ||
            !this.blockEditorAlias ||
            !this.contentElementType || 
            !this.blockListValue.contentData ||
            !this.blockListValue.layout) return;

        const previewData: PreviewListBlockData = {
            blockEditorAlias: this.blockEditorAlias,
            nodeKey: this.unique,
            contentElementAlias: this.contentElementType.alias,
            culture: this.culture,
            requestBody: JSON.stringify(this.blockListValue)
        };

        const { data } = await tryExecuteAndNotify(this, BlockPreviewService.previewListBlock(previewData));

        if (data) this.htmlMarkup = data;
    }

    render() {
        if (this.htmlMarkup !== "") {
            return html`
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

export default BlockListPreviewCustomView;

declare global {
    interface HTMLElementTagNameMap {
        [elementName]: BlockListPreviewCustomView;
    }
}
