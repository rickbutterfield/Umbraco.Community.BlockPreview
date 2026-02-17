import { UmbDataSourceResponse } from "@umbraco-cms/backoffice/repository";
import { BlockPreviewService } from "../api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";

// Query type definitions
export interface GridPreviewQuery {
    blockEditorAlias: string;
    nodeKey: string;
    contentElementAlias: string;
    documentTypeUnique: string;
    contentUdi: string;
    settingsUdi: string;
    culture: string;
    blockIndex: number;
}

export interface ListPreviewQuery {
    blockEditorAlias: string;
    nodeKey: string;
    contentElementAlias: string;
    documentTypeUnique: string;
    contentUdi: string;
    settingsUdi: string;
    culture: string;
    blockIndex: number;
}

export interface RtePreviewQuery {
    blockEditorAlias: string;
    nodeKey: string;
    contentElementAlias: string;
    documentTypeUnique: string;
    culture: string;
}

export interface StylesheetQuery {
    documentTypeUnique: string;
    nodeKey: string;
}

export interface IPreviewDataSource {
    previewGridBlock(body: string, query: GridPreviewQuery): Promise<UmbDataSourceResponse<string>>;
    previewListBlock(body: string, query: ListPreviewQuery): Promise<UmbDataSourceResponse<string>>;
    previewRichTextMarkup(body: string, query: RtePreviewQuery): Promise<UmbDataSourceResponse<string>>;
    getGridStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>>;
    getListStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>>;
    getRteStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>>;
}

export class PreviewDataSource implements IPreviewDataSource {
    #host: UmbControllerHost;

    constructor(host: UmbControllerHost) {
        this.#host = host;
    }

    async previewGridBlock(body: string, query: GridPreviewQuery): Promise<UmbDataSourceResponse<string>> {
        return await tryExecute(this.#host, BlockPreviewService.previewGridBlock({ body, query }));
    }

    async previewListBlock(body: string, query: ListPreviewQuery): Promise<UmbDataSourceResponse<string>> {
        return await tryExecute(this.#host, BlockPreviewService.previewListBlock({ body, query }));
    }

    async previewRichTextMarkup(body: string, query: RtePreviewQuery): Promise<UmbDataSourceResponse<string>> {
        return await tryExecute(this.#host, BlockPreviewService.previewRichTextMarkup({ body, query }));
    }

    async getGridStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>> {
        return await tryExecute(this.#host, BlockPreviewService.getGridStylesheets({ query }));
    }

    async getListStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>> {
        return await tryExecute(this.#host, BlockPreviewService.getListStylesheets({ query }));
    }

    async getRteStylesheets(query: StylesheetQuery): Promise<UmbDataSourceResponse<string[]>> {
        return await tryExecute(this.#host, BlockPreviewService.getRteStylesheets({ query }));
    }
}
