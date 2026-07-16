import { RequestResult } from "../api/client/types.gen.js";
import {
    previewGridBlock as previewGridBlockApi,
    previewListBlock as previewListBlockApi,
    previewSingleBlock as previewSingleBlockApi,
    previewRichTextMarkup as previewRichTextMarkupApi,
    getGridStylesheets as getGridStylesheetsApi,
    getSingleBlockStylesheets as getSingleBlockStylesheetsApi,
    getListStylesheets as getListStylesheetsApi,
    getRteStylesheets as getRteStylesheetsApi
} from "../api/sdk.gen.js";
import {
    GetGridStylesheetsResponses,
    GetListStylesheetsResponses,
    PreviewGridBlockData,
    PreviewGridBlockResponses,
    PreviewListBlockData,
    PreviewRichTextMarkupResponses,
    GetRteStylesheetsResponses,
    GetRteStylesheetsData,
    GetListStylesheetsData,
    GetGridStylesheetsData,
    GetSingleBlockStylesheetsData,
    GetSingleBlockStylesheetsResponses,
    PreviewSingleBlockData,
    PreviewRichTextMarkupData,
    PreviewListBlockResponses,
    PreviewSingleBlockResponses
} from "../api/index.js";

// Query type definitions
export interface BlockPreviewQuery {
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
    previewGridBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewGridBlockResponses, unknown, ThrowOnError>;
    previewListBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewListBlockData, unknown, ThrowOnError>;

    previewSingleBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewSingleBlockData, unknown, ThrowOnError>;
    previewRichTextMarkup<ThrowOnError extends boolean = false>(body: string, query: RtePreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewRichTextMarkupResponses, unknown, ThrowOnError>;

    getSingleBlockStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetSingleBlockStylesheetsResponses, unknown, ThrowOnError>;
    getGridStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetGridStylesheetsResponses, unknown, ThrowOnError>;
    getListStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetListStylesheetsResponses, unknown, ThrowOnError>;
    getRteStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetRteStylesheetsResponses, unknown, ThrowOnError>;
}

export class PreviewDataSource implements IPreviewDataSource {

    previewGridBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewGridBlockResponses, unknown, ThrowOnError> {
        const data = {
            body: body,
            query: {
                nodeKey: query.nodeKey,
                blockEditorAlias: query.blockEditorAlias,
                contentElementAlias: query.contentElementAlias,
                documentTypeUnique: query.documentTypeUnique,
                contentUdi: query.contentUdi,
                settingsUdi: query.settingsUdi,
                culture: query.culture,
                blockIndex: query.blockIndex
            }
        } as PreviewGridBlockData;
        return previewGridBlockApi<ThrowOnError>({ ...data, throwOnError });
    }

    previewListBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewListBlockResponses, unknown, ThrowOnError> {
        const data = {
            body: body,
            query: {
                nodeKey: query.nodeKey,
                blockEditorAlias: query.blockEditorAlias,
                contentElementAlias: query.contentElementAlias,
                documentTypeUnique: query.documentTypeUnique,
                contentUdi: query.contentUdi,
                settingsUdi: query.settingsUdi,
                culture: query.culture,
                blockIndex: query.blockIndex
            }
        } as PreviewListBlockData;
        return previewListBlockApi<ThrowOnError>({ ...data, throwOnError });
    }

    previewSingleBlock<ThrowOnError extends boolean = false>(body: string, query: BlockPreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewSingleBlockResponses, unknown, ThrowOnError> {
        const data = {
            body: body,
            query: {
                nodeKey: query.nodeKey,
                blockEditorAlias: query.blockEditorAlias,
                contentElementAlias: query.contentElementAlias,
                documentTypeUnique: query.documentTypeUnique,
                contentUdi: query.contentUdi,
                settingsUdi: query.settingsUdi,
                culture: query.culture,
                blockIndex: query.blockIndex
            }
        } as PreviewSingleBlockData;
        return previewSingleBlockApi<ThrowOnError>({ ...data, throwOnError });
    }

    previewRichTextMarkup<ThrowOnError extends boolean = false>(body: string, query: RtePreviewQuery, throwOnError?: ThrowOnError):
        RequestResult<PreviewRichTextMarkupResponses, unknown, ThrowOnError> {
        const data = {
            body: body,
            query: {
                nodeKey: query.nodeKey,
                blockEditorAlias: query.blockEditorAlias,
                contentElementAlias: query.contentElementAlias,
                documentTypeUnique: query.documentTypeUnique,
                culture: query.culture
            }
        } as PreviewRichTextMarkupData;
        return previewRichTextMarkupApi<ThrowOnError>({ ...data, throwOnError });
    }

    getSingleBlockStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetSingleBlockStylesheetsResponses, unknown, ThrowOnError> {
        const data = {
            query: {
                nodeKey: query.nodeKey,
                documentTypeUnique: query.documentTypeUnique
            }
        } as GetSingleBlockStylesheetsData;
        return getSingleBlockStylesheetsApi<ThrowOnError>({ ...data, throwOnError });
    }

    getGridStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetGridStylesheetsResponses, unknown, ThrowOnError> {
        const data = {
            query: {
                nodeKey: query.nodeKey,
                documentTypeUnique: query.documentTypeUnique
            }
        } as GetGridStylesheetsData;
        return getGridStylesheetsApi<ThrowOnError>({ ...data, throwOnError });
    }

    getListStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetListStylesheetsResponses, unknown, ThrowOnError> {
        const data = {
            query: {
                nodeKey: query.nodeKey,
                documentTypeUnique: query.documentTypeUnique
            }
        } as GetListStylesheetsData;
        return getListStylesheetsApi<ThrowOnError>({ ...data, throwOnError });
    }

    getRteStylesheets<ThrowOnError extends boolean = false>(query: StylesheetQuery, throwOnError?: ThrowOnError):
        RequestResult<GetRteStylesheetsResponses, unknown, ThrowOnError> {
        const data = {
            query: {
                nodeKey: query.nodeKey,
                documentTypeUnique: query.documentTypeUnique
            }
        } as GetRteStylesheetsData;
        return getRteStylesheetsApi<ThrowOnError>({ ...data, throwOnError });
    }
}
