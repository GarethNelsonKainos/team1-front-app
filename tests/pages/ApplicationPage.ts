import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ApplicationPage extends BasePage {
  readonly roleHeading: Locator;
  readonly applyNowButton: Locator;
  readonly applyFormHeading: Locator;
  readonly cvInput: Locator;
  readonly submitButton: Locator;
  readonly errorHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.roleHeading = page.locator('h1');
    this.applyNowButton = page.getByRole('link', { name: /Apply Now/i });
    this.applyFormHeading = page.locator('h2');
    this.cvInput = page.locator('#cv');
    this.submitButton = page.locator('#submitButton');
    this.errorHeading = page.locator('h1, h2');
  }

  async clickRoleByName(name: string) {
    await this.page.getByRole('link', { name: new RegExp(name) }).click();
  }

  async clickApplyNow() {
    await this.applyNowButton.click();
  }

  async uploadCv(buffer: Buffer) {
    await this.cvInput.setInputFiles({
      name: 'test-cv.pdf',
      mimeType: 'application/pdf',
      buffer,
    });
  }

  async submitApplication() {
    await this.submitButton.click();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}
