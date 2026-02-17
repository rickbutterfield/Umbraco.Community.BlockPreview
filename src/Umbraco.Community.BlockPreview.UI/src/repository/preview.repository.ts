import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import {
    PreviewDataSource,
    type GridPreviewQuery,
    type ListPreviewQuery,
    type RtePreviewQuery,
    type StylesheetQuery
} from "./preview.data-source";

export class PreviewRepository extends UmbControllerBase {
    #dataSource: PreviewDataSource;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#dataSource = new PreviewDataSource(host);
    }

    async previewGridBlock(body: string, query: GridPreviewQuery) {
        return await this.#dataSource.previewGridBlock(body, query);
    }

    async previewListBlock(body: string, query: ListPreviewQuery) {
        return await this.#dataSource.previewListBlock(body, query);
    }

    async previewRichTextMarkup(body: string, query: RtePreviewQuery) {
        return await this.#dataSource.previewRichTextMarkup(body, query);
    }

    async getGridStylesheets(query: StylesheetQuery) {
        return await this.#dataSource.getGridStylesheets(query);
    }

    async getListStylesheets(query: StylesheetQuery) {
        return await this.#dataSource.getListStylesheets(query);
    }

    async getRteStylesheets(query: StylesheetQuery) {
        return await this.#dataSource.getRteStylesheets(query);
    }
}
