import { Page } from "@playwright/test"
import { umbracoConfig } from "../../umbraco.config";
import { ApiHelpers as UmbracoApiHelpers } from "@umbraco-cms/acceptance-test-helpers";

export class ApiHelpers {
  baseUrl: string = umbracoConfig.environment.baseUrl;
  umbracoApi: UmbracoApiHelpers;
  page: Page;

  constructor(page: Page, umbracoApi: UmbracoApiHelpers) {
    this.umbracoApi = umbracoApi;
    this.page = page;
  }

  async get(url: string, params?: { [key: string]: string | number | boolean; }) {
    return await this.umbracoApi.get(url, params);
  };

  async post(url: string, data?: object) {
    return await this.umbracoApi.post(url, data);
  };

  async delete(url: string, data?: object) {
    return await this.umbracoApi.delete(url, data);
  };
}
