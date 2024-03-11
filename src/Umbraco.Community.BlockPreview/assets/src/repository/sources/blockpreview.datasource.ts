import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDataSourceResponse } from "@umbraco-cms/backoffice/repository";
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { BlockGridValueModel, BlockListValueModel, BlockPreviewResource } from "../../api";

export interface BlockPreviewDataSource {

    previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockGridValueModel): Promise<UmbDataSourceResponse<string>>;
    previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockListValueModel): Promise<UmbDataSourceResponse<string>>;

}

export class BlockPreviewManagementDataSource implements BlockPreviewDataSource {

  #host: UmbControllerHost;

  constructor(host: UmbControllerHost) {
    this.#host = host;
  }

    async previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockGridValueModel): Promise<UmbDataSourceResponse<string>> {
    return await tryExecuteAndNotify(this.#host, BlockPreviewResource.postUmbracoBlockpreviewApiV1PreviewGridMarkup({ pageId, blockEditorAlias, culture, requestBody }));
  }

    async previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockListValueModel): Promise<UmbDataSourceResponse<string>> {
    return await tryExecuteAndNotify(this.#host, BlockPreviewResource.postUmbracoBlockpreviewApiV1PreviewListMarkup({ pageId, blockEditorAlias, culture, requestBody }));
  }

 }