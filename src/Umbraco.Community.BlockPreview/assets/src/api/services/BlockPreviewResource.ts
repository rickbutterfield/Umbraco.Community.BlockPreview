/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlockGridValueModel } from '../models/BlockGridValueModel';
import type { BlockListValueModel } from '../models/BlockListValueModel';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BlockPreviewResource {

    /**
     * @returns string Success
     * @throws ApiError
     */
    public static postUmbracoBlockpreviewApiV1PreviewGridMarkup({
pageId,
blockEditorAlias = '',
culture = '',
requestBody,
}: {
pageId?: number,
blockEditorAlias?: string,
culture?: string,
requestBody?: BlockGridValueModel,
}): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/umbraco/blockpreview/api/v1/previewGridMarkup',
            query: {
                'pageId': pageId,
                'blockEditorAlias': blockEditorAlias,
                'culture': culture,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns string Success
     * @throws ApiError
     */
    public static postUmbracoBlockpreviewApiV1PreviewListMarkup({
pageId,
blockEditorAlias = '',
culture = '',
requestBody,
}: {
pageId?: number,
blockEditorAlias?: string,
culture?: string,
requestBody?: BlockListValueModel,
}): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/umbraco/blockpreview/api/v1/previewListMarkup',
            query: {
                'pageId': pageId,
                'blockEditorAlias': blockEditorAlias,
                'culture': culture,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
