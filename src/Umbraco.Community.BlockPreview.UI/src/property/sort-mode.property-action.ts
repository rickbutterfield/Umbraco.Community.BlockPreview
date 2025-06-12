import { UmbPropertyActionArgs, UmbPropertyActionBase } from "@umbraco-cms/backoffice/property-action";
import { MetaPropertyActionSortModeKind } from "./types";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UMB_PROPERTY_CONTEXT } from "@umbraco-cms/backoffice/property";
import { BLOCK_PREVIEW_CONTEXT } from "../context/block-preview.context-token";

export class UmbSortModePropertyAction extends
    UmbPropertyActionBase<MetaPropertyActionSortModeKind> {

    #init: Promise<unknown>;
    #propertyContext?: typeof UMB_PROPERTY_CONTEXT.TYPE;
    #blockPreviewContext?: typeof BLOCK_PREVIEW_CONTEXT.TYPE;

    constructor(host: UmbControllerHost, args: UmbPropertyActionArgs<MetaPropertyActionSortModeKind>) {
        super(host, args);

        this.#init = Promise.all([
            this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
                this.#propertyContext = context;
            }).asPromise(),

            this.consumeContext(BLOCK_PREVIEW_CONTEXT, (context) => {
                this.#blockPreviewContext = context;
                this.#blockPreviewContext?.setSortMode(false);
            }).asPromise()
        ]);
    }

    override async execute() {
        await this.#init;

        if (!this.#propertyContext) throw new Error('Property context not found');
        if (!this.#blockPreviewContext) throw new Error('Block preview context not found');

        const isSortModeActive = await this.#blockPreviewContext.getSortMode();
        await this.#blockPreviewContext.setSortMode(!isSortModeActive);
    }
}

export { UmbSortModePropertyAction as api };