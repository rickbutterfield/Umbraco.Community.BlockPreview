import { Page } from "@playwright/test"
import { UiHelpers as UmbracoUiHelpers } from "@umbraco/playwright-testhelpers";

export class UiHelpers {
  page: Page;
  umbracoUi: UmbracoUiHelpers;

  constructor(page: Page, umbracoUi: UmbracoUiHelpers) {
    this.page = page;
    this.umbracoUi = umbracoUi;
  }
}
