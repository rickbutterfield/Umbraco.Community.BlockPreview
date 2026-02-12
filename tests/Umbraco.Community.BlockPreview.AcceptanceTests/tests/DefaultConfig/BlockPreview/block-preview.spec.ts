import { expect } from "@playwright/test";
import { ConstantHelper } from "@umbraco/playwright-testhelpers";
import { test } from "../../../lib/index";

/**
 * Searches shadow DOM recursively for block preview errors.
 * Returns an object with the count of preview elements and any error messages found.
 */
async function getBlockPreviewStatus(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const previewTags = ['block-grid-preview', 'block-list-preview', 'rich-text-preview'];
    const results = { previewCount: 0, errors: [] as string[] };

    function search(root: Document | ShadowRoot) {
      for (const tag of previewTags) {
        const elements = root.querySelectorAll(tag);
        for (const el of elements) {
          results.previewCount++;
          if (el.shadowRoot) {
            const errorAlerts = el.shadowRoot.querySelectorAll('.preview-alert-error');
            for (const alert of errorAlerts) {
              results.errors.push(alert.textContent?.trim() ?? '');
            }
          }
        }
      }

      for (const el of root.querySelectorAll('*')) {
        if ((el as HTMLElement).shadowRoot) {
          search((el as HTMLElement).shadowRoot!);
        }
      }
    }

    search(document);
    return results;
  });
}

test.describe("Block Preview", () => {
  test.beforeEach(async ({ umbracoApi }, testInfo) => {
    await umbracoApi.report.report(testInfo);
  });

  /*
   * Smoke Tests - Verify backoffice loads and content section is accessible
   */

  test("Can navigate to the content section @smoke", async ({ umbracoUi }) => {
    // Act
    await umbracoUi.goToBackOffice();
    await umbracoUi.content.goToSection(ConstantHelper.sections.content);

    // Assert
    await expect(umbracoUi.page.locator('umb-section-main')).toBeVisible();
  });

  /*
   * Block Grid Preview Tests
   */

  test("Block Grid page renders block previews @smoke", async ({ umbracoUi, page }) => {
    // Arrange
    await umbracoUi.goToBackOffice();
    await umbracoUi.content.goToSection(ConstantHelper.sections.content);

    // Act - Expand Home node and navigate to a Block Grid content node
    await umbracoUi.content.openContentCaretButtonForName('Home');
    await umbracoUi.content.goToContentWithName('Nested Block Grid Test');
    await page.waitForTimeout(1000);

    // Assert - Preview elements should be present with no errors
    const status = await getBlockPreviewStatus(page);
    expect(status.previewCount).toBeGreaterThan(0);
    expect(status.errors).toEqual([]);
  });

  test("Block List page renders block previews @smoke", async ({ umbracoUi, page }) => {
    // Arrange
    await umbracoUi.goToBackOffice();
    await umbracoUi.content.goToSection(ConstantHelper.sections.content);

    // Act - Expand Home node and navigate to a Block List content node
    await umbracoUi.content.openContentCaretButtonForName('Home');
    await umbracoUi.content.goToContentWithName('Block List Test');
    await page.waitForTimeout(1000);

    // Assert - Preview elements should be present with no errors
    const status = await getBlockPreviewStatus(page);
    expect(status.previewCount).toBeGreaterThan(0);
    expect(status.errors).toEqual([]);
  });
});
