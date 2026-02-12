import {test as setup} from '@playwright/test';
import {STORAGE_STATE} from '../playwright.config';
import {ConstantHelper, UiHelpers} from "@umbraco/playwright-testhelpers";

setup('authenticate', async ({page}) => {
  const umbracoUi = new UiHelpers(page);

  await umbracoUi.goToBackOffice();
  // Wait for login form to be ready
  await page.locator('[name="username"]').waitFor({state: 'visible', timeout: 30000});
  await umbracoUi.login.enterEmail(process.env.UMBRACO_USER_LOGIN);
  await umbracoUi.login.enterPassword(process.env.UMBRACO_USER_PASSWORD);
  await umbracoUi.login.clickLoginButton();
  // Wait for backoffice to load after login
  await page.getByTestId('section-links').waitFor({state: 'visible', timeout: 30000});
  await umbracoUi.login.goToSection(ConstantHelper.sections.content);
  await umbracoUi.page.context().storageState({path: STORAGE_STATE});
});
