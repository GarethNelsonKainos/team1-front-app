import { Page, expect } from '@playwright/test';

/**
 * Common test helpers
 */

export async function assertPageLoaded(page: Page, expectedURL: RegExp) {
  await expect(page).toHaveURL(expectedURL);
}

export async function waitForElement(page: Page, selector: string) {
  await page.waitForSelector(selector);
}
