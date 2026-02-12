import { test as base } from "@umbraco/playwright-testhelpers";
import { UiHelpers } from "@umbraco/playwright-testhelpers";
import { ApiHelpers as BlockPreviewApiHelpers, UiHelpers as BlockPreviewUiHelpers } from ".";

const test = base.extend<{ blockPreviewApi: BlockPreviewApiHelpers } & { blockPreviewUi: BlockPreviewUiHelpers }>({
  blockPreviewApi: async ({ umbracoApi, page }, use) => {
    const blockPreviewApi = new BlockPreviewApiHelpers(page, umbracoApi);
    await use(blockPreviewApi);
  },

  blockPreviewUi: async ({ page }, use) => {
    const umbracoUi = new UiHelpers(page);
    const blockPreviewUi = new BlockPreviewUiHelpers(page, umbracoUi);
    await use(blockPreviewUi);
  },
})

export { test };
