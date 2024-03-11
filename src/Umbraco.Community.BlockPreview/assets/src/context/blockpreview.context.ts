import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

import { BlockPreviewManagementRepository } from "../repository/blockpreview.repository";

import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth'
import { BlockGridValueModel, BlockListValueModel, OpenAPI } from "../api";
import { UmbStringState } from "@umbraco-cms/backoffice/observable-api";

export class BlockPreviewManagementContext extends UmbControllerBase {

  #repository: BlockPreviewManagementRepository;

  #markup = new UmbStringState("");
  public readonly markup = this.#markup.asObservable();

  constructor(host: UmbControllerHost) {
    super(host);

    this.provideContext(BLOCKPREVIEW_MANAGEMENT_CONTEXT_TOKEN, this);
    this.#repository = new BlockPreviewManagementRepository(this);

    this.consumeContext(UMB_AUTH_CONTEXT, (_auth) => {
      OpenAPI.TOKEN = () => _auth.getLatestToken();
      OpenAPI.WITH_CREDENTIALS = true;
    });

  }

  async previewGridMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockGridValueModel) {
    const { data } = await this.#repository.previewGridMarkup(pageId, blockEditorAlias, culture, requestBody);
    if (data) {
      this.#markup.setValue(data);
    }
  }

  async previewListMarkup(pageId?: number, blockEditorAlias?: string, culture?: string, requestBody?: BlockListValueModel) {
    const { data } = await this.#repository.previewListMarkup(pageId, blockEditorAlias, culture, requestBody);
    if (data) {
      this.#markup.setValue(data);
    }
  }
  
}

export default BlockPreviewManagementContext;

export const BLOCKPREVIEW_MANAGEMENT_CONTEXT_TOKEN = new UmbContextToken<BlockPreviewManagementContext>(BlockPreviewManagementContext.name);